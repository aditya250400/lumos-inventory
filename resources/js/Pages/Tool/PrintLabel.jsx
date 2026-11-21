import { useEffect, useRef } from 'react';
import './PrintLabel.css';

export default function PrintLabel({ tool }) {
    const accessories = tool?.accessories ?? [];
    const total = accessories.length + 1;
    const maxListed = 4;

    const locationName = tool?.location
        ? tool.location.parent?.name
            ? `${tool.location.name} (${tool.location.parent.name})`
            : tool.location.name
        : '-';

    useEffect(() => {
        const previousTitle = document.title;

        document.title = `Label-${tool?.tool_code ?? 'Tool'}`;

        const timer = setTimeout(() => {
            window.print();
        }, 700);

        return () => {
            clearTimeout(timer);
            document.title = previousTitle;
        };
    }, [tool?.tool_code]);

    return (
        <div className="print-wrapper">
            {/* =========================================
                LABEL TOOL UTAMA
            ========================================= */}

            <div className={`print-label ${accessories.length === 0 ? 'last' : ''}`}>
                <LabelHeader code={tool.tool_code} page={total > 1 ? `1/${total}` : ''} />

                <div className="label-name">{tool.name}</div>

                <table className="label-info">
                    <tbody>
                        <tr>
                            <td className="label-key">Tipe</td>
                            <td>: {tool.inventory_type}</td>
                        </tr>

                        <tr>
                            <td className="label-key">Lokasi</td>
                            <td>: {locationName}</td>
                        </tr>

                        <tr>
                            <td className="label-key">Digunakan</td>
                            <td>: {tool.used_by?.name ?? 'Semua Staff'}</td>
                        </tr>

                        {tool.status == 'Rusak' && (
                            <tr>
                                <td className="label-key">Status</td>
                                <td>: {tool.status}</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {accessories.length > 0 && (
                    <>
                        <div className="label-accessory-title">Kelengkapan Semua ({accessories.length + 1})</div>
                        <div>- {tool.name}</div>

                        <div className="label-accessory-list">
                            {accessories.map((item, index) => (
                                <div key={item.id ?? index}>- {item.name}</div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* =========================================
                LABEL SETIAP KELENGKAPAN
            ========================================= */}

            {accessories.map((accessory, index) => (
                <div
                    key={accessory.id ?? index}
                    className={`print-label ${index === accessories.length - 1 ? 'last' : ''}`}
                >
                    <LabelHeader code={tool.tool_code} page={`${index + 2}/${total}`} />

                    <div className="label-name small">{accessory.name}</div>

                    <div className="label-sub">Kelengkapan dari {tool.name}</div>
                </div>
            ))}

            {/* TOMBOL CETAK, TIDAK IKUT DICETAK */}
            <div className="no-print print-actions">
                <button onClick={() => window.print()}>Cetak Label</button>
            </div>
        </div>
    );
}

/*
============================================================
HEADER LABEL
============================================================
*/

function LabelHeader({ code, page }) {
    return (
        <table className="label-header">
            <tbody>
                <tr>
                    <td>{code}</td>
                    <td className="label-page">{page}</td>
                </tr>
            </tbody>
        </table>
    );
}
