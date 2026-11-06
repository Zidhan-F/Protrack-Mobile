<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * RBAC: operator hanya melihat notifikasi SPK departemennya.
     * Admin melihat semuanya.
     */
    private function scoped(Request $request)
    {
        $user = $request->user();

        return Notification::query()->when(
            $user && $user->isOperator(),
            function ($q) use ($user) {
                $q->whereHas('spk', function ($spk) use ($user) {
                    $spk->where('production_department_id', $user->departmentId());
                });
            }
        );
    }

    public function index(Request $request)
    {
        $notifications = $this->scoped($request)
            ->with('spk')
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get();

        $unreadCount = $this->scoped($request)->where('is_read', false)->count();

        return response()->json([
            'success' => true,
            'unread_count' => $unreadCount,
            'data' => $notifications,
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $this->scoped($request)->findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi ditandai telah dibaca.',
            'notification' => $notification,
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $this->scoped($request)->where('is_read', false)->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi ditandai telah dibaca.',
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $notification = $this->scoped($request)->findOrFail($id);
        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil dihapus.',
        ]);
    }
}
