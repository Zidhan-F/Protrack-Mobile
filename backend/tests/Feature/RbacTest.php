<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\ProductionDepartment;
use App\Models\Spk;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    private $customer;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['Develop', 'Offset', 'Plotter', 'UV', 'Finishing'] as $i => $nama) {
            ProductionDepartment::updateOrCreate(['id' => $i + 1], ['nama_bagian' => $nama]);
        }

        $this->customer = Customer::create(['nama_customer' => 'PT Uji']);
    }

    private function user(string $role): User
    {
        return User::create([
            'name'     => ucfirst($role),
            'email'    => "{$role}@test.com",
            'password' => Hash::make('secret123'),
            'role'     => $role,
        ]);
    }

    private function spk(int $deptId, string $status = 'belum_diproses', string $no = null): Spk
    {
        return Spk::create([
            'customer_id'              => $this->customer->id,
            'production_department_id' => $deptId,
            'no_spk'                   => $no ?? 'SPK/26/01/' . str_pad($deptId . rand(0, 999), 4, '0', STR_PAD_LEFT),
            'tanggal_spk'              => now()->toDateString(),
            'deadline_date'            => now()->addDays(5)->toDateString(),
            'priority'                 => 'normal',
            'status'                   => $status,
        ]);
    }

    public function test_endpoints_require_authentication()
    {
        $this->getJson('/api/spk')->assertStatus(401);
        $this->getJson('/api/dashboard')->assertStatus(401);
        $this->postJson('/api/spk/1/update-status', ['status' => 'selesai'])->assertStatus(401);
        $this->postJson('/api/import-xml')->assertStatus(401);
    }

    public function test_login_returns_token_and_role()
    {
        $this->user('offset');

        $res = $this->postJson('/api/login', [
            'email'    => 'offset@test.com',
            'password' => 'secret123',
        ]);

        $res->assertOk()
            ->assertJsonPath('user.role', 'offset')
            ->assertJsonPath('user.department_id', 2);

        $this->assertNotEmpty($res->json('token'));

        $this->postJson('/api/login', [
            'email'    => 'offset@test.com',
            'password' => 'salah',
        ])->assertStatus(401);
    }

    public function test_token_from_login_can_access_protected_route_and_logout_revokes_it()
    {
        $this->user('admin');

        $token = $this->postJson('/api/login', [
            'email'    => 'admin@test.com',
            'password' => 'secret123',
        ])->json('token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/spk')
            ->assertOk();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_only_admin_can_mutate_spk_and_import()
    {
        $payload = [
            'production_department_id' => 2,
            'tanggal_spk'              => now()->toDateString(),
            'priority'                 => 'normal',
            'nama_customer'            => 'PT Baru',
        ];

        Sanctum::actingAs($this->user('offset'));
        $this->postJson('/api/spk/store', $payload)->assertStatus(403);
        $this->postJson('/api/import-xml')->assertStatus(403);

        $spk = $this->spk(2);
        $this->postJson("/api/spk/{$spk->id}/update", ['priority' => 'urgent'])->assertStatus(403);
        $this->deleteJson('/api/spk-detail/1')->assertStatus(403);
    }

    public function test_admin_can_create_spk()
    {
        Sanctum::actingAs($this->user('admin'));

        $this->postJson('/api/spk/store', [
            'production_department_id' => 2,
            'tanggal_spk'              => now()->toDateString(),
            'priority'                 => 'normal',
            'nama_customer'            => 'PT Baru',
        ])->assertStatus(201);
    }

    public function test_operator_only_sees_own_department_spk()
    {
        $offsetSpk = $this->spk(2, 'belum_diproses', 'SPK/26/01/0002');
        $uvSpk     = $this->spk(4, 'belum_diproses', 'SPK/26/01/0004');

        Sanctum::actingAs($this->user('offset'));

        $list = $this->getJson('/api/spk')->assertOk()->json();
        $this->assertCount(1, $list);
        $this->assertSame($offsetSpk->id, $list[0]['id']);

        $this->getJson("/api/spk/{$offsetSpk->id}")->assertOk();
        $this->getJson("/api/spk/{$uvSpk->id}")->assertStatus(403);

        $this->getJson('/api/dashboard')->assertOk()->assertJsonPath('totalSpk', 1);
    }

    public function test_admin_sees_all_spk()
    {
        $this->spk(2, 'belum_diproses', 'SPK/26/01/0002');
        $this->spk(4, 'belum_diproses', 'SPK/26/01/0004');

        Sanctum::actingAs($this->user('admin'));

        $this->assertCount(2, $this->getJson('/api/spk')->assertOk()->json());
        $this->getJson('/api/dashboard')->assertOk()->assertJsonPath('totalSpk', 2);
    }

    public function test_operator_cannot_update_other_department_spk()
    {
        $uvSpk = $this->spk(4);

        Sanctum::actingAs($this->user('offset'));

        $this->postJson("/api/spk/{$uvSpk->id}/update-status", ['status' => 'sedang_diproses'])
            ->assertStatus(403);

        $this->assertSame('belum_diproses', $uvSpk->fresh()->status);
    }

    public function test_operator_status_is_restricted_by_role()
    {
        $spk = $this->spk(2);

        Sanctum::actingAs($this->user('offset'));

        // Operator cetak tidak boleh langsung menyelesaikan tahap Finishing
        $this->postJson("/api/spk/{$spk->id}/update-status", ['status' => 'sedang_finishing'])
            ->assertStatus(403);

        $this->postJson("/api/spk/{$spk->id}/update-status", ['status' => 'terlambat'])
            ->assertStatus(403);

        $this->postJson("/api/spk/{$spk->id}/update-status", ['status' => 'ngawur'])
            ->assertStatus(422);

        $this->postJson("/api/spk/{$spk->id}/update-status", ['status' => 'sedang_diproses'])
            ->assertOk();

        $this->assertSame('sedang_diproses', $spk->fresh()->status);
    }

    public function test_print_operator_done_forwards_spk_to_finishing_and_logs_real_user()
    {
        $spk  = $this->spk(2, 'sedang_diproses');
        $user = $this->user('offset');

        Sanctum::actingAs($user);

        $this->postJson("/api/spk/{$spk->id}/update-status", ['status' => 'selesai'])
            ->assertOk();

        $spk = $spk->fresh();
        $this->assertSame('menunggu_finishing', $spk->status);
        $this->assertSame(5, (int) $spk->production_department_id);

        $this->assertDatabaseHas('progress_logs', [
            'spk_id'     => $spk->id,
            'user_id'    => $user->id,
            'new_status' => 'menunggu_finishing',
        ]);

        // Setelah diteruskan, SPK hilang dari antrean operator offset
        $this->getJson("/api/spk/{$spk->id}")->assertStatus(403);
    }

    public function test_finishing_operator_flow()
    {
        $spk = $this->spk(5, 'menunggu_finishing');

        Sanctum::actingAs($this->user('finishing'));

        $this->postJson("/api/spk/{$spk->id}/update-status", ['status' => 'sedang_diproses'])
            ->assertStatus(403);

        $this->postJson("/api/spk/{$spk->id}/update-status", ['status' => 'sedang_finishing'])
            ->assertOk();

        $this->postJson("/api/spk/{$spk->id}/update-status", ['status' => 'selesai'])
            ->assertOk();

        $this->assertSame('selesai', $spk->fresh()->status);
    }

    public function test_register_cannot_create_admin_without_admin_login()
    {
        $payload = [
            'name'                  => 'Orang Asing',
            'email'                 => 'x@test.com',
            'password'              => 'secret123',
            'password_confirmation' => 'secret123',
            'role'                  => 'admin',
        ];

        $this->postJson('/api/register', $payload)->assertStatus(403);
        $this->assertDatabaseMissing('users', ['email' => 'x@test.com']);

        // Role di luar daftar ditolak
        $this->postJson('/api/register', array_merge($payload, ['role' => 'superuser']))
            ->assertStatus(422);

        // Operator boleh mendaftar
        $this->postJson('/api/register', array_merge($payload, ['role' => 'uv']))
            ->assertStatus(201);
    }

    public function test_admin_can_create_admin_account()
    {
        Sanctum::actingAs($this->user('admin'));

        $this->postJson('/api/register', [
            'name'                  => 'Admin Baru',
            'email'                 => 'admin2@test.com',
            'password'              => 'secret123',
            'password_confirmation' => 'secret123',
            'role'                  => 'admin',
        ])->assertStatus(201);
    }

    public function test_change_password_only_affects_logged_in_user()
    {
        $me    = $this->user('plotter');
        $other = $this->user('uv');

        Sanctum::actingAs($me);

        // Mengirim email orang lain tidak boleh berpengaruh
        $this->postJson('/api/change-password', [
            'email'                     => $other->email,
            'old_password'              => 'secret123',
            'new_password'              => 'barubaru1',
            'new_password_confirmation' => 'barubaru1',
        ])->assertOk();

        $this->assertTrue(Hash::check('barubaru1', $me->fresh()->password));
        $this->assertTrue(Hash::check('secret123', $other->fresh()->password));
    }
}
