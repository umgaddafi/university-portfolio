import React, { useState } from 'react';
import '../../styles/app.css';

export function StaffPaymentsSections({ staff }) {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear.toString());
    const [month, setMonth] = useState('April');

    const years = Array.from({ length: currentYear - 2024 }, (_, i) => (currentYear - i).toString());
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const downloadSlip = () => {
        window.print();
    };

    return (
        <div className="main-content" style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', width: '100%', overflowX: 'hidden' }}>
            <style>
                {`
                @media print {
                    /* Hide unnecessary layout elements entirely */
                    .portal-sidebar, .staff-portal-topbar-shell, .portal-topbar, .no-print {
                        display: none !important;
                    }
                    /* Reset wrappers to allow natural flow without scrollbars or min-heights */
                    body, .portal-layout, .portal-content, .section-stack, .main-content {
                        display: block !important;
                        position: relative !important;
                        height: auto !important;
                        min-height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        background: white !important;
                        width: 100% !important;
                    }
                    .payslip-print-area {
                        margin-top: 0 !important;
                        padding: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    @page {
                        margin: 0.5cm;
                    }
                }
                `}
            </style>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }} className="no-print">
                <div style={{ backgroundColor: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '1rem', boxShadow: 'var(--card-shadow)' }}>
                    <h3 style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Months Paid</h3>
                    <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text)', margin: 0 }}>4</p>
                </div>
                <div style={{ backgroundColor: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '1rem', boxShadow: 'var(--card-shadow)' }}>
                    <h3 style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>This Month</h3>
                    <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--success)', margin: 0 }}>Ready</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '0.5rem', marginBottom: '2rem', alignItems: 'center' }} className="no-print">
                <select value={year} onChange={e => setYear(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--input-border)', flex: '1', minWidth: '0' }}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={month} onChange={e => setMonth(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--input-border)', flex: '1', minWidth: '0' }}>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {months.indexOf(month) <= 5 && (
                    <button onClick={downloadSlip} className="btn primary" style={{ marginLeft: 'auto', padding: '0.5rem 0.8rem', whiteSpace: 'nowrap' }}>Download Slip</button>
                )}
            </div>

            {/* PAYSLIP CONTAINER */}
            {months.indexOf(month) > 5 ? (
                <div style={{ backgroundColor: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
                    <h2 style={{ color: 'var(--muted)', fontSize: '1.25rem' }}>Payslip for {month} {year} is not yet available</h2>
                </div>
            ) : (
                <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', paddingBottom: '1rem' }} className="payslip-mobile-wrapper">
                    <div className="payslip-print-area" style={{ 
                        minWidth: '800px',
                        backgroundColor: '#fff', 
                        border: '1px solid #000', 
                        padding: '2rem', 
                        fontFamily: 'Arial, sans-serif',
                        color: '#000',
                        position: 'relative'
                    }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <img src="/images/jostum.jpeg" alt="Logo" style={{ width: '100px', height: '110px', objectFit: 'contain' }} />
                        <div style={{ paddingTop: '10px' }}>
                            <h2 style={{ margin: 0, color: '#103463', fontSize: '1.15rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>JOSEPH SARWUAN TARKA UNIVERSITY, MAKURDI</h2>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#103463', fontWeight: 'bold' }}>P. M. B 2373, MAKURDI</p>
                            
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem', gap: '1rem' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.95rem', marginLeft: '130px' }}>Payroll Month:</span>
                                <div style={{ border: '1px solid #f0f0f0', backgroundColor: '#fdfdfd', padding: '0.1rem 2.5rem', fontSize: '0.95rem', fontWeight: 'bold' }}>
                                    {month}-{year}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ paddingTop: '45px' }}>
                        <h1 style={{ margin: 0, color: '#103463', fontSize: '2.5rem', fontFamily: 'Times New Roman, serif', letterSpacing: '1px' }}>PAYSLIP</h1>
                    </div>
                </div>

                {/* Blue Separator Line */}
                <div style={{ borderTop: '2px solid #103463', marginBottom: '1.5rem', marginTop: '-1.2rem', width: '70%', marginLeft: '110px' }}></div>

                {/* Employee Details Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '1rem', marginBottom: '2rem', fontSize: '0.85rem' }}>
                    
                    {/* Left Details block */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <span style={{ fontWeight: 'bold', width: '70px', flexShrink: 0 }}>Surname</span>
                            <div style={{ border: '1px solid #f0f0f0', padding: '0.2rem 0.5rem', width: '170px', flexShrink: 0 }}>{staff?.last_name || 'GADDAFI'}</div>
                            <span style={{ fontWeight: 'bold', width: '60px', marginLeft: '10px', flexShrink: 0 }}>Others</span>
                            <div style={{ border: '1px solid #f0f0f0', padding: '0.2rem 0.5rem', flex: 1, minWidth: 0 }}>{staff?.first_name || 'UMAR'} {staff?.middle_name || ''}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <span style={{ fontWeight: 'bold', width: '70px', flexShrink: 0 }}>Emp No</span>
                            <div style={{ border: '1px solid #f0f0f0', padding: '0.2rem 0.5rem', width: '90px', flexShrink: 0 }}>{staff?.staff_number || 'PF5797'}</div>
                            <span style={{ fontWeight: 'bold', width: '50px', marginLeft: '30px', flexShrink: 0 }}>Scale</span>
                            <div style={{ border: '1px solid #f0f0f0', padding: '0.2rem 0.5rem', width: '80px', flexShrink: 0 }}>CONTISS</div>
                            <span style={{ fontWeight: 'bold', width: '40px', marginLeft: '10px', flexShrink: 0 }}>Level</span>
                            <div style={{ border: '1px solid #f0f0f0', padding: '0.2rem 0.5rem', width: '50px', flexShrink: 0 }}>CT07</div>
                            <span style={{ fontWeight: 'bold', width: '40px', marginLeft: '10px', flexShrink: 0 }}>Step</span>
                            <div style={{ border: '1px solid #f0f0f0', padding: '0.2rem 0.5rem', width: '40px', flexShrink: 0 }}>02</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <span style={{ fontWeight: 'bold', width: '70px', flexShrink: 0 }}>PFA</span>
                            <div style={{ border: '1px solid #f0f0f0', padding: '0.2rem 0.5rem', width: '270px', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Stanbic IBTC Pension Managers Limited</div>
                            <span style={{ fontWeight: 'bold', width: '60px', marginLeft: '10px', flexShrink: 0 }}>PFA PIN</span>
                            <div style={{ border: '1px solid #f0f0f0', padding: '0.2rem 0.5rem', flex: 1, minWidth: 0 }}>PEN110245304089</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <span style={{ fontWeight: 'bold', width: '70px', flexShrink: 0 }}>Dept</span>
                            <div style={{ border: '1px solid #f0f0f0', padding: '0.2rem 0.5rem', width: '270px', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Directorate of Information and Communicat</div>
                            <span style={{ fontWeight: 'bold', width: '90px', marginLeft: '10px', flexShrink: 0 }}>Designation</span>
                            <div style={{ border: '1px solid #f0f0f0', padding: '0.2rem 0.5rem', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Programmer/Analyst II</div>
                        </div>

                    </div>

                    {/* Right Details Block */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '70px', fontSize: '0.9rem' }}>Bank:</span>
                            <div style={{ border: '1px solid #f0f0f0', padding: '0.3rem 0.5rem', flex: 1, fontStyle: 'italic', fontSize: '0.9rem' }}>Fidelity Bank Plc</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '70px', fontSize: '0.9rem' }}>Acct #:</span>
                            <div style={{ border: '1px solid #f0f0f0', padding: '0.3rem 0.5rem', flex: 1, fontStyle: 'italic', fontSize: '0.9rem' }}>6173905754</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '70px', fontSize: '0.9rem' }}>Paypoint:</span>
                            <div style={{ border: '1px solid #f0f0f0', padding: '0.3rem 0.5rem', flex: 1, height: '28px' }}></div>
                        </div>
                    </div>
                </div>

                {/* Tables Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                    
                    {/* Income Table */}
                    <div>
                        <div style={{ marginBottom: '0.2rem', fontSize: '0.9rem', color: '#000' }}>PR Income &amp; Allowances</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0', fontSize: '0.8rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                    <th style={{ textAlign: 'left', padding: '0.2rem 0.5rem', borderRight: '1px solid #fff', fontWeight: 'bold' }}>Item</th>
                                    <th style={{ textAlign: 'right', padding: '0.2rem 0.5rem', borderRight: '1px solid #fff', fontWeight: 'bold', width: '90px' }}>Amount</th>
                                    <th style={{ textAlign: 'center', padding: '0.2rem 0.5rem', fontWeight: 'bold', width: '30px' }}>OM</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>CONSOLIDATED</td><td style={{ textAlign: 'right', padding: '0.1rem 0.5rem', border: 'none' }}>175,441.50</td><td style={{ textAlign: 'center', padding: '0.1rem 0.5rem', border: 'none' }}></td></tr>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>HZD ALW</td><td style={{ textAlign: 'right', padding: '0.1rem 0.5rem', border: 'none' }}>30,000.00</td><td style={{ textAlign: 'center', padding: '0.1rem 0.5rem', border: 'none' }}></td></tr>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>HRZ ARRS</td><td style={{ textAlign: 'right', padding: '0.1rem 0.5rem', border: 'none' }}>60,000.00</td><td style={{ textAlign: 'center', padding: '0.1rem 0.5rem', border: 'none' }}>0</td></tr>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>SALARY ARREARS</td><td style={{ textAlign: 'right', padding: '0.1rem 0.5rem', border: 'none' }}>350,883.00</td><td style={{ textAlign: 'center', padding: '0.1rem 0.5rem', border: 'none' }}>0</td></tr>
                                {/* Empty rows to match height */}
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>&nbsp;</td><td style={{ border: 'none' }}></td><td style={{ border: 'none' }}></td></tr>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>&nbsp;</td><td style={{ border: 'none' }}></td><td style={{ border: 'none' }}></td></tr>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>&nbsp;</td><td style={{ border: 'none' }}></td><td style={{ border: 'none' }}></td></tr>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>&nbsp;</td><td style={{ border: 'none' }}></td><td style={{ border: 'none' }}></td></tr>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>&nbsp;</td><td style={{ border: 'none' }}></td><td style={{ border: 'none' }}></td></tr>
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Deductions Table */}
                    <div>
                        <div style={{ marginBottom: '0.2rem', fontSize: '0.9rem', color: '#000' }}>PR Deductions</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0', fontSize: '0.8rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                    <th style={{ textAlign: 'left', padding: '0.2rem 0.5rem', borderRight: '1px solid #fff', fontWeight: 'bold' }}>Item</th>
                                    <th style={{ textAlign: 'right', padding: '0.2rem 0.5rem', borderRight: '1px solid #fff', fontWeight: 'bold', width: '90px' }}>Amount</th>
                                    <th style={{ textAlign: 'center', padding: '0.2rem 0.5rem', fontWeight: 'bold', width: '30px' }}>OM</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>NATIONAL HOUSING FUND</td><td style={{ textAlign: 'right', padding: '0.1rem 0.5rem', border: 'none' }}>4,386.04</td><td style={{ textAlign: 'center', padding: '0.1rem 0.5rem', border: 'none' }}></td></tr>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>TAX</td><td style={{ textAlign: 'right', padding: '0.1rem 0.5rem', border: 'none' }}>90,122.57</td><td style={{ textAlign: 'center', padding: '0.1rem 0.5rem', border: 'none' }}></td></tr>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>PENSION</td><td style={{ textAlign: 'right', padding: '0.1rem 0.5rem', border: 'none' }}>14,035.32</td><td style={{ textAlign: 'center', padding: '0.1rem 0.5rem', border: 'none' }}></td></tr>
                                {/* Empty rows to match height */}
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>&nbsp;</td><td style={{ border: 'none' }}></td><td style={{ border: 'none' }}></td></tr>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>&nbsp;</td><td style={{ border: 'none' }}></td><td style={{ border: 'none' }}></td></tr>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>&nbsp;</td><td style={{ border: 'none' }}></td><td style={{ border: 'none' }}></td></tr>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>&nbsp;</td><td style={{ border: 'none' }}></td><td style={{ border: 'none' }}></td></tr>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>&nbsp;</td><td style={{ border: 'none' }}></td><td style={{ border: 'none' }}></td></tr>
                                <tr><td style={{ padding: '0.1rem 0.5rem', border: 'none' }}>&nbsp;</td><td style={{ border: 'none' }}></td><td style={{ border: 'none' }}></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Totals Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', paddingRight: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#103463', marginRight: '1rem', fontSize: '0.95rem' }}>Total Earnings:</span>
                            <div style={{ border: '1px solid #e0e0e0', padding: '0.2rem 0.5rem', fontWeight: 'bold', fontSize: '0.95rem', width: '120px', textAlign: 'right' }}>616,324.50</div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: '2.5rem' }}>
                            <span style={{ fontWeight: 'bold', color: '#103463', width: '150px', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>Total Deductions</span>
                            <div style={{ border: '1px solid #e0e0e0', padding: '0.2rem 0.5rem', fontWeight: 'bold', fontSize: '0.95rem', width: '120px', textAlign: 'right' }}>108,543.93</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: '2.5rem', marginTop: '0.2rem', paddingTop: '0.5rem', borderTop: '2px solid #000', width: 'fit-content' }}>
                            <span style={{ fontWeight: 'bold', color: '#000', width: '150px', fontSize: '0.95rem' }}>Net Salary:</span>
                            <div style={{ border: '1px solid #e0e0e0', padding: '0.2rem 0.5rem', fontWeight: 'bold', fontSize: '0.95rem', width: '120px', textAlign: 'right' }}>507,780.57</div>
                        </div>
                    </div>
                </div>

                {/* Dashed Line */}
                <div style={{ marginTop: '3rem', borderBottom: '1px dashed #999' }}></div>

            </div>
                </div>
            )}
        </div>
    );
}
