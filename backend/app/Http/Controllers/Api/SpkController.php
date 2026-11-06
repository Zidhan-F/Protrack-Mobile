<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Spk;
use Illuminate\Http\Request;
use App\Models\SpkDetail;
use App\Models\ProgressLog;
use App\Models\Customer;
use App\Models\ProductionDepartment;
use App\Models\User;

class SpkController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | List SPK
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $query = Spk::with([
            'customer',
            'department'
        ])
        ->leftJoin(
            'customers',
            'spks.customer_id',
            '=',
            'customers.id'
        )
        ->leftJoin(
            'production_departments',
            'spks.production_department_id',
            '=',
            'production_departments.id'
        )
        ->select('spks.*');

        // ========================
        // RBAC: operator hanya melihat SPK departemennya
        // ========================

        $user = $request->user();

        if ($user && $user->isOperator()) {

            $query->where(
                'spks.production_department_id',
                $user->departmentId()
            );

        }

        // ========================
        // Search
        // ========================

        if ($request->filled('search')) {

            $search = $request->search;

            $query->where(function ($q) use ($search) {

                $q->where('no_spk', 'like', "%{$search}%")
                ->orWhere('priority', 'like', "%{$search}%")
                ->orWhere('status', 'like', "%{$search}%")
                ->orWhere('deadline_date', 'like', "%{$search}%")
                ->orWhereHas('customer', function ($customer) use ($search) {

                    $customer->where(
                        'nama_customer',
                        'like',
                        "%{$search}%"
                    );

                });

            });

        }

        // ========================
        // Filter Status
        // ========================

        if ($request->status) {

            // Filter SPK terlambat
            if ($request->status == 'terlambat') {

                $query->whereDate(
                    'deadline_date',
                    '<',
                    now()->toDateString()
                )
                ->where(
                    'status',
                    '!=',
                    'selesai'
                );

            } else {

                $query->where(
                    'status',
                    $request->status
                );

            }

        }


        // ========================
        // Filter Deadline
        // ========================

        if ($request->deadline == 'besok') {

            $query->whereDate(
                'deadline_date',
                now()->addDay()->toDateString()
            )
            ->where(
                'status',
                '!=',
                'selesai'
            );

        }

        // ========================
        // Filter Department
        // ========================

        if ($request->department) {

            $query->where(
                'production_department_id',
                $request->department
            );

        }

        // ========================
        // Filter Priority
        // ========================

        if ($request->priority) {

            $query->where(
                'priority',
                $request->priority
            );

        }

        // ========================
        // Filter Customer
        // ========================

        if ($request->customer) {

            $query->where(
                'customer_id',
                $request->customer
            );

        }

        // ========================
        // Sorting
        // ========================

        $sort = $request->get(
            'sort',
            'created_at'
        );

        $direction = $request->get(
            'direction',
            'desc'
        );

        switch ($sort) {

            case 'customer':

                $query->orderBy(
                    'customers.nama_customer',
                    $direction
                );

            break;

            case 'department':

                $query->orderBy(
                    'production_departments.nama_bagian',
                    $direction
                );

            break;

            default:

                $query->orderBy(
                    $sort,
                    $direction
                );

        }

        $spks = $query->get();

        return response()->json($spks);
    }

    /*
    |--------------------------------------------------------------------------
    | Detail SPK
    |--------------------------------------------------------------------------
    */

    public function show(Request $request, $id)
    {
        $spk = Spk::with([
            'customer',
            'department',
            'details',
            'progressLogs.user'
        ])->findOrFail($id);

        if (!$request->user()->canAccessSpk($spk)) {
            return response()->json([
                'success' => false,
                'message' => 'SPK ini bukan bagian dari departemen Anda.'
            ], 403);
        }

        return response()->json($spk);
    }

    public function store(Request $request)
    {

        $request->validate([
            'production_department_id' => 'required',
            'tanggal_spk' => 'required',
            'priority' => 'required',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Resolusi Customer (Pilih dari ID atau Ketik Manual)
        |--------------------------------------------------------------------------
        */
        $customerId = null;
        if ($request->filled('nama_customer')) {
            $customer = Customer::firstOrCreate([
                'nama_customer' => trim($request->nama_customer)
            ]);
            $customerId = $customer->id;
        } elseif ($request->filled('customer_id')) {
            if (is_numeric($request->customer_id)) {
                $customerId = $request->customer_id;
            } else {
                $customer = Customer::firstOrCreate([
                    'nama_customer' => trim($request->customer_id)
                ]);
                $customerId = $customer->id;
            }
        }

        if (!$customerId) {
            return response()->json([
                'message' => 'Pelanggan / Customer wajib diisi atau dipilih.'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Generate No SPK
        |--------------------------------------------------------------------------
        */

        $tahun = date('y');
        $bulan = date('m');

        $lastSpk = Spk::latest()->first();

        if ($lastSpk && preg_match('/(\d+)$/', $lastSpk->no_spk, $match)) {
            $urut = intval($match[1]) + 1;
        } else {
            $urut = 1;
        }

        $noSpk =
            'SPK/' .
            $tahun . '/' .
            $bulan . '/' .
            str_pad(
                $urut,
                4,
                '0',
                STR_PAD_LEFT
            );

        /*
        |--------------------------------------------------------------------------
        | Simpan SPK
        |--------------------------------------------------------------------------
        */

        $spk = Spk::create([

            'customer_id' => $customerId,

            'production_department_id' =>
                $request->production_department_id,

            'no_spk' => $noSpk,

            'tanggal_spk' => $request->tanggal_spk,

            'deadline_date' => $request->deadline_date,

            'priority' => $request->priority,

            'status' => 'belum_diproses',

            'keterangan' => $request->keterangan,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Simpan Detail
        |--------------------------------------------------------------------------
        */

        if ($request->filled('details')) {

            foreach ($request->details as $item) {

                if (empty($item['nama_file'])) {
                    continue;
                }

                SpkDetail::create([

                    'spk_id' => $spk->id,

                    'nama_file' => $item['nama_file'] ?? null,

                    'bahan' => $item['bahan'] ?? null,

                    'panjang' => $item['panjang'] ?? null,

                    'lebar' => $item['lebar'] ?? null,

                    'qty' => $item['qty'] ?? null,

                    'finishing' => $item['finishing'] ?? null,

                ]);
            }
        }

        \App\Models\Notification::create([
            'spk_id' => $spk->id,
            'title' => 'SPK Baru Dibuat',
            'message' => "SPK {$spk->no_spk} berhasil dibuat.",
            'is_read' => false,
        ]);

        return response()->json([
            "success" => true,
            "message" => "SPK berhasil dibuat",
            "data" => $spk
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $spk = Spk::findOrFail($id);

        $spk->update([
            'deadline_date' => $request->deadline_date,
            'priority'      => $request->priority,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Update detail lama
        |--------------------------------------------------------------------------
        */

        if ($request->filled('details')) {

            foreach ($request->details as $item) {

                if (!isset($item['id'])) {
                    continue;
                }

                $detail = SpkDetail::where('id', $item['id'])
                            ->where('spk_id', $spk->id)
                            ->first();

                if (!$detail) {
                    continue;
                }

                $detail->update([
                    'nama_file' => $item['nama_file'] ?? null,
                    'bahan' => $item['bahan'] ?? null,
                    'panjang' => $item['panjang'] ?? null,
                    'lebar' => $item['lebar'] ?? null,
                    'qty' => $item['qty'] ?? null,
                    'finishing' => $item['finishing'] ?? null,
                ]);
            }

        }

        /*
        |--------------------------------------------------------------------------
        | Tambah detail baru
        |--------------------------------------------------------------------------
        */

        if ($request->newItems) {

            foreach ($request->newItems as $item) {

                if (empty($item['nama_file'])) {
                    continue;
                }

                SpkDetail::create([
                    'spk_id'    => $spk->id,
                    'nama_file' => $item['nama_file'],
                    'bahan'     => $item['bahan'],
                    'panjang'   => $item['panjang'],
                    'lebar'     => $item['lebar'],
                    'qty'       => $item['qty'],
                    'finishing' => $item['finishing'],
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'SPK berhasil diupdate',
            'data'    => $spk->load('details'),
        ]);
    }

    public function deleteDetail($id)
    {
        $detail = \App\Models\SpkDetail::findOrFail($id);

        $detail->delete();

        return response()->json([
            "success" => true,
            "message" => "Detail berhasil dihapus"
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', \App\Models\User::SPK_STATUSES)
        ]);

        $spk = Spk::findOrFail($id);

        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | RBAC: akses SPK & status yang boleh di-set
        |--------------------------------------------------------------------------
        */

        if (!$user->canAccessSpk($spk)) {
            return response()->json([
                'success' => false,
                'message' => 'SPK ini bukan bagian dari departemen Anda.'
            ], 403);
        }

        if (!in_array($request->status, $user->allowedStatuses(), true)) {
            return response()->json([
                'success' => false,
                'message' => 'Role Anda tidak diizinkan mengubah ke status tersebut.'
            ], 403);
        }

        $oldStatus = $spk->status;

        /*
        |--------------------------------------------------------------------------
        | Jika selesai tetapi bukan departemen finishing
        |--------------------------------------------------------------------------
        */

        if (
            $request->status == 'selesai' &&
            $spk->production_department_id != 5
        ) {

            $spk->update([
                'status' => 'menunggu_finishing',
                'production_department_id' => 5
            ]);

            ProgressLog::create([
                'spk_id' => $spk->id,

                'user_id' => $user->id,

                'old_status' => $oldStatus,

                'new_status' => 'menunggu_finishing',

                'catatan' => 'Otomatis dikirim ke Finishing'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'SPK otomatis dikirim ke Finishing',
                'spk' => $spk->load([
                    'customer',
                    'department',
                    'details',
                    'progressLogs.user'
                ])
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Update status biasa
        |--------------------------------------------------------------------------
        */

        $spk->update([
            'status' => $request->status
        ]);

        ProgressLog::create([
            'spk_id' => $spk->id,

            'user_id' => $user->id,

            'old_status' => $oldStatus,

            'new_status' => $request->status,

            'catatan' => $request->catatan
        ]);

        \App\Models\Notification::create([
            'spk_id' => $spk->id,
            'title' => 'Status SPK Diperbarui',
            'message' => "SPK {$spk->no_spk} diubah ke status: " . str_replace('_', ' ', $request->status),
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status berhasil diperbarui',
            'spk' => $spk->load([
                'customer',
                'department',
                'details',
                'progressLogs.user'
            ])
        ]);
    }
}