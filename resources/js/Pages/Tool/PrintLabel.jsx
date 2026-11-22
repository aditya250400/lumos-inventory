import { useCallback, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import './PrintLabel.css';

const PX_TO_MM = 25.4 / 96;

export default function PrintLabel({ tool }) {
    const labelsRef = useRef(null);
    const title = `Label-${tool?.tool_code ?? 'Tool'}`;

    const accessories = tool?.accessories ?? [];
    const total = accessories.length + 1;

    const locationName = tool?.location
        ? tool.location.parent?.name
            ? `${tool.location.name} (${tool.location.parent.name})`
            : tool.location.name
        : '-';

    /*
     * Ukur tinggi seluruh label, lalu set ukuran halaman cetak
     * sama dengan tinggi itu supaya hasil PDF hanya 1 halaman.
     */
    const handlePrint = useCallback(() => {
        const el = labelsRef.current;
        if (!el) return;

        const heightMm = Math.ceil(el.getBoundingClientRect().height * PX_TO_MM) + 2;

        let style = document.getElementById('print-page-size');
        if (!style) {
            style = document.createElement('style');
            style.id = 'print-page-size';
            document.head.appendChild(style);
        }
        style.textContent = `@page { size: 58mm ${heightMm}mm; margin: 0; }`;
        document.title = title;
        window.print();
    }, []);

    useEffect(() => {
        const previousTitle = document.title;
        document.title = `Label-${tool?.tool_code ?? 'Tool'}`;

        const timer = setTimeout(handlePrint, 700);

        return () => {
            clearTimeout(timer);
            document.title = previousTitle;
            document.getElementById('print-page-size')?.remove();
        };
    }, [tool?.tool_code, handlePrint]);

    return (
        <>
            <Head title={title} />
            <div className="print-wrapper">
                <div ref={labelsRef} className="print-labels">
                    {/* =========================================
                    LABEL TOOL UTAMA
                ========================================= */}

                    <div className={`print-label ${accessories.length === 0 ? 'last' : ''}`}>
                        <LabelHeader code={tool.tool_code} page={`1/${total}`} />

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

                                {tool.status === 'Rusak' && (
                                    <tr>
                                        <td className="label-key">Status</td>
                                        <td>: {tool.status}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="label-accessory-title">Kelengkapan Semua ({total})</div>
                        <div>- {tool.name}</div>
                        {accessories.length > 0 && (
                            <>
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
                </div>

                {/* TOMBOL CETAK, TIDAK IKUT DICETAK */}
                <div className="no-print print-actions">
                    <button onClick={handlePrint}>Cetak Label</button>
                </div>
            </div>
        </>
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
