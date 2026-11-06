<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

use App\Models\Customer;
use App\Models\Spk;
use App\Models\SpkDetail;
use App\Models\ProductionDepartment;

class ImportController extends Controller
{
    
    public function index()
    {
        return response()->json(['status' => 'Import XML API active']);
    }

    public function import(Request $request)
    {

        $request->validate([
            'xml_file' => 'required|file'
        ]);

        try {

            $xmlFile = $request->file('xml_file');

            $xml = simplexml_load_file(
                $xmlFile->getRealPath()
            );

            $deliveryOrder =
                $xml->TRANSACTIONS->DELIVERYORDER;

            $noSpk =
                (string) $deliveryOrder->INVOICENO;

            // Cek apakah SPK sudah pernah diimport
            if (
                Spk::where(
                    'no_spk',
                    $noSpk
                )->exists()
            ) {

                return response()->json([
                    "success" => false,
                    "message" => "SPK sudah pernah diimport"
                ], 422);

            }

            // Customer
            $customerName = trim(
                (string) $deliveryOrder->SHIPTO1
            );

            $customer = Customer::firstOrCreate([
                'nama_customer' => $customerName
            ]);

            // Tentukan Departemen
            $description = strtoupper(
                (string) $deliveryOrder->DESCRIPTION
            );

            if (str_contains($description, 'DEVELOP')) {

                $departmentName = 'Develop';

            } elseif (str_contains($description, 'OFFSET')) {

                $departmentName = 'Offset';

            } elseif (str_contains($description, 'PLOTTER')) {

                $departmentName = 'Plotter';

            } elseif (str_contains($description, 'UV')) {

                $departmentName = 'UV';

            } elseif (str_contains($description, 'FINISHING')) {

                $departmentName = 'Finishing';

            } else {

                return response()->json([
                    "success" => false,
                    "message" => "Departemen tidak ditemukan"
                ], 422);

            }

            // Cari master departemen
            $department =
                ProductionDepartment::where(
                    'nama_bagian',
                    $departmentName
                )->first();

            if (!$department) {

                return response()->json([
                    "success" => false,
                    "message" => "Master departemen belum tersedia"
                ], 422);

            }

            // Simpan SPK
            $spk = Spk::create([

                'customer_id' => $customer->id,

                'production_department_id' => $department->id,

                'no_spk' => $noSpk,

                'tanggal_spk' => date('Y-m-d'),

                'status' => 'belum_diproses',

                'priority' => 'normal',

                'keterangan' => (string) $deliveryOrder->DESCRIPTION

            ]);

            // Simpan Detail
            foreach ($deliveryOrder->ITEMLINE as $item) {

                SpkDetail::create([

                    'spk_id' => $spk->id,

                    'nama_file' => (string) $item->ITEMRESERVED1,

                    'bahan' => (string) $item->ITEMOVDESC,

                    'panjang' => (float) $item->ITEMRESERVED2,

                    'lebar' => (float) $item->ITEMRESERVED3,

                    'qty' => (int) $item->QUANTITY,

                    'finishing' => (string) $item->ITEMRESERVED6

                ]);

            }

            \App\Models\Notification::create([
                'spk_id' => $spk->id,
                'title' => 'Import SPK Berhasil',
                'message' => "SPK {$noSpk} berhasil di-import dari file XML.",
                'is_read' => false,
            ]);

            return response()->json([
                "success" => true,
                "message" => "Import XML berhasil",
                "spk_id" => $spk->id
            ]);

        } catch (\Exception $e) {

            return response()->json([
                "success" => false,
                "message" => "XML gagal diproses",
                "error" => $e->getMessage()
            ], 500);

        }
    }
}