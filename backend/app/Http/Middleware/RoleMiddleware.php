<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Pemakaian: ->middleware('role:admin') atau ->middleware('role:admin,offset')
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $isApi = $request->expectsJson() || $request->is('api/*');

        $user = $request->user();

        // Jika belum login
        if (!$user) {

            if ($isApi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Silakan login terlebih dahulu.'
                ], 401);
            }

            return redirect('/login');

        }

        // Jika role tidak sesuai
        if (!in_array($user->role, $roles, true)) {

            if ($isApi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki hak akses untuk aksi ini.'
                ], 403);
            }

            abort(
                403,
                'FORBIDDEN ACCESS'
            );

        }

        return $next($request);
    }
}