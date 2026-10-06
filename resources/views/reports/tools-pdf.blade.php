<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: sans-serif;
            font-size: 11px;
            color: #222;
        }

        h1 {
            font-size: 16px;
            margin-bottom: 4px;
        }

        p.sub {
            color: #777;
            margin-top: 0;
            margin-bottom: 16px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #ccc;
            padding: 6px 8px;
            text-align: left;
        }

        th {
            background: #f0f0f0;
        }
    </style>
</head>

<body>
    <h1>Laporan Tools</h1>
    <p class="sub">Dicetak pada {{ now()->translatedFormat('d F Y H:i') }}</p>

    <table>
        <thead>
            <tr>
                <th>Kode</th>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Lokasi</th>
                <th>Tipe</th>
                <th>Status</th>
                <th>Stok</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($tools as $tool)
            <tr>
                <td>{{ $tool->tool_code }}</td>
                <td>{{ $tool->name }}</td>
                <td>{{ $tool->category->name }}</td>
                <td>
                    {{ $tool->location->name }}
                    @if ($tool->location->parent)
                    ({{ $tool->location->parent->name }})
                    @endif
                </td>
                <td>{{ $tool->inventory_type }}</td>
                <td>{{ $tool->status }}</td>
                <td>{{ $tool->stock }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>