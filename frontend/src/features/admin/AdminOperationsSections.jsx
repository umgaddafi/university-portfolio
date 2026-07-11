import { useEffect, useState } from 'react';
import { AdminPageHeader, Field } from '../../components/common/ui';
import { usePendingAction } from '../../hooks/usePendingAction';
import { AdminRequestsWorkspace } from './AdminRequestsWorkspace';
import { formatDateTime } from '../../utils/formatters';
import { useConfirm } from '../../contexts/ConfirmContext';

function AdminVerificationQueueSection({ summary, reloadPortal, showFlash }) {
    return (
        <AdminRequestsWorkspace
            summary={summary}
            reloadPortal={reloadPortal}
            showFlash={showFlash}
            title="Pending Verifications"
            subtitle="Focus on unprocessed staff submissions first, then move through the wider request timeline only when needed."
            initialQueueMode="pending-only"
            initialTab="pending"
        />
    );
}

function AdminAccountsRolesSection({
    staff,
    onAssignRole,
    onDeactivate,
    onReactivate,
    onForcePasswordReset,
    onResendInvite,
    onUnlock,
}) {
    const [filters, setFilters] = useState({ search: '', role: '', departmentId: '' });
    const [roleDrafts, setRoleDrafts] = useState({});
    const { isPending, runPending } = usePendingAction();
    const confirm = useConfirm();

    useEffect(() => {
        setRoleDrafts(buildRoleDrafts(staff.items));
    }, [staff.items]);

    const selectedDepartment = staff.filters.departments.find((item) => String(item.id) === String(filters.departmentId));
    const filteredItems = staff.items.filter((item) => {
        const searchValue = filters.search.trim().toLowerCase();

        if (searchValue && !`${item.name} ${item.email} ${item.staffNumber} ${item.username || ''}`.toLowerCase().includes(searchValue)) {
            return false;
        }

        if (selectedDepartment && item.departmentName !== selectedDepartment.name) {
            return false;
        }

        if (filters.role === 'NULL' && item.role) {
            return false;
        }

        if (filters.role && filters.role !== 'NULL' && item.role !== filters.role) {
            return false;
        }

        return true;
    });
    const roleCounts = buildRoleCounts(staff.items);
    const inactiveCount = staff.items.filter((item) => item.hasAccount && !item.isActive).length;
    const resetRequiredCount = staff.items.filter((item) => item.forcePasswordChange).length;
    const attentionItems = filteredItems.filter((item) => (
        !item.hasAccount
        || !item.isActive
        || item.forcePasswordChange
        || !item.departmentName
        || !item.rankName
    ));

    async function saveRole(item) {
        const nextRole = roleDrafts[item.staffId] || 'Staff';
        const actionKey = `assign-role-${item.staffId}`;
        const isCreating = !item.hasAccount;
        const actionLabel = isCreating ? 'create a linked account' : `set the role to ${nextRole}`;

        await confirm({
            title: 'Confirm Role Update',
            message: `Are you sure you want to ${actionLabel} for ${item.name}?`,
            confirmText: 'Confirm',
            danger: false,
            action: () => runPending(actionKey, () => onAssignRole(item.staffId, nextRole))
        });
    }

    async function deactivateAccount(item) {
        await confirm({
            title: 'Deactivate Account',
            message: `Deactivate ${item.name}'s account? They will not be able to sign in until reactivated.`,
            confirmText: 'Deactivate',
            danger: true,
            action: () => runPending(`deactivate-${item.staffId}`, () => onDeactivate(item.staffId))
        });
    }

    async function reactivateAccount(item) {
        await runPending(`reactivate-${item.staffId}`, () => onReactivate(item.staffId));
    }

    async function forcePasswordReset(item) {
        await confirm({
            title: 'Force Password Reset',
            message: `Require ${item.name} to change password on their next login?`,
            confirmText: 'Force Reset',
            danger: false,
            action: () => runPending(`force-reset-${item.staffId}`, () => onForcePasswordReset(item.staffId))
        });
    }

    async function resendInvite(item) {
        await confirm({
            title: 'Resend Invite',
            message: `Resend invite for ${item.name}? This will refresh their password and send new credentials.`,
            confirmText: 'Resend Invite',
            danger: false,
            action: () => runPending(`resend-invite-${item.staffId}`, () => onResendInvite(item.staffId))
        });
    }

    async function unlockAccount(item) {
        await confirm({
            title: 'Unlock Account',
            message: `Unlock ${item.name}'s account and require a password update on next login?`,
            confirmText: 'Unlock',
            danger: false,
            action: () => runPending(`unlock-${item.staffId}`, () => onUnlock(item.staffId))
        });
    }

    return (
        <>
            <AdminPageHeader
                title="User Accounts & Roles"
                subtitle="Track access coverage, role assignment, and staff records that still need account attention."
            />
            <div className="admin-dashboard-stats admin-role-stats">
                <div className="admin-dashboard-stat is-primary">
                    <div>
                        <h3>Administrators</h3>
                        <strong>{roleCounts.Admin}</strong>
                    </div>
                </div>
                <div className="admin-dashboard-stat is-warning">
                    <div>
                        <h3>Moderators</h3>
                        <strong>{roleCounts.Moderator}</strong>
                    </div>
                </div>
                <div className="admin-dashboard-stat is-success">
                    <div>
                        <h3>Staff Accounts</h3>
                        <strong>{roleCounts.Staff}</strong>
                    </div>
                </div>
                <div className="admin-dashboard-stat is-neutral">
                    <div>
                        <h3>No Linked Account</h3>
                        <strong>{roleCounts.None}</strong>
                    </div>
                </div>
                <div className="admin-dashboard-stat is-warning">
                    <div>
                        <h3>Inactive Accounts</h3>
                        <strong>{inactiveCount}</strong>
                    </div>
                </div>
                <div className="admin-dashboard-stat is-primary">
                    <div>
                        <h3>Reset Required</h3>
                        <strong>{resetRequiredCount}</strong>
                    </div>
                </div>
            </div>
            <section className="admin-filter-card card">
                <div className="admin-filter-grid is-access">
                    <Field label="Search Name / Email / PF Number">
                        <input
                            className="input"
                            value={filters.search}
                            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                            placeholder="Search staff access records..."
                        />
                    </Field>
                    <Field label="Role">
                        <select
                            className="select"
                            value={filters.role}
                            onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}
                        >
                            <option value="">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Moderator">Moderator</option>
                            <option value="Staff">Staff</option>
                            <option value="NULL">No Account</option>
                        </select>
                    </Field>
                    <Field label="Department">
                        <select
                            className="select"
                            value={filters.departmentId}
                            onChange={(event) => setFilters((current) => ({ ...current, departmentId: event.target.value }))}
                        >
                            <option value="">All Departments</option>
                            {staff.filters.departments.map((department) => (
                                <option key={department.id} value={department.id}>{department.name}</option>
                            ))}
                        </select>
                    </Field>
                    <div className="admin-filter-reset">
                        <button
                            type="button"
                            className="admin-button admin-button-secondary"
                            onClick={() => setFilters({ search: '', role: '', departmentId: '' })}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </section>
            <section className="admin-panel card">
                <div className="admin-panel-header">
                    <h3>Access Directory</h3>
                </div>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Staff</th>
                                <th>Account</th>
                                <th>PF Number</th>
                                <th>Department</th>
                                <th>Rank</th>
                                <th>Role Control</th>
                                <th>Access Status</th>
                                <th>Security</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="admin-empty-cell">No access records match the current filters.</td>
                                </tr>
                            ) : filteredItems.map((item) => (
                                <tr key={item.staffId}>
                                    <td>
                                        <div className="admin-cell-stack">
                                            <strong>{item.name}</strong>
                                            <span>{item.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="admin-cell-stack">
                                            <strong>{item.username || 'No account'}</strong>
                                            <span>{item.hasAccount ? 'Linked sign-in account' : 'Create an account by assigning a role'}</span>
                                        </div>
                                    </td>
                                    <td>{item.staffNumber}</td>
                                    <td>{item.departmentName || 'Not assigned'}</td>
                                    <td>{item.rankName || 'Not assigned'}</td>
                                    <td>
                                        <div className="admin-access-role-cell">
                                            <select
                                                className="select"
                                                value={roleDrafts[item.staffId] || 'Staff'}
                                                onChange={(event) => setRoleDrafts((current) => ({
                                                    ...current,
                                                    [item.staffId]: event.target.value,
                                                }))}
                                            >
                                                <option value="Staff">Staff</option>
                                                <option value="Moderator">Moderator</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                            <button
                                                type="button"
                                                className="admin-icon-button is-edit"
                                                onClick={() => {
                                                    void saveRole(item);
                                                }}
                                                disabled={isPending(`assign-role-${item.staffId}`) || (item.hasAccount && (roleDrafts[item.staffId] || item.role || 'Staff') === (item.role || ''))}
                                            >
                                                {isPending(`assign-role-${item.staffId}`)
                                                    ? (item.hasAccount ? 'Saving...' : 'Creating...')
                                                    : (item.hasAccount ? 'Save Role' : 'Create Account')}
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="admin-access-status-stack">
                                            <span className={`admin-badge ${item.hasAccount ? (item.isActive ? 'is-approved' : 'is-rejected') : 'is-warning'}`}>
                                                {item.hasAccount ? (item.isActive ? 'Active' : 'Inactive') : 'Needs Account'}
                                            </span>
                                            {item.hasAccount ? <span className="admin-access-hint">{item.role || 'No role assigned'}</span> : null}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="admin-access-status-stack">
                                            <span className={`admin-badge ${item.forcePasswordChange ? 'is-warning' : 'is-success'}`}>
                                                {item.forcePasswordChange ? 'Reset Required' : 'Password Ready'}
                                            </span>
                                            <span className="admin-access-hint">
                                                {item.forcePasswordChange ? 'Next sign-in requires update' : 'No password action pending'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="admin-table-actions is-wrap">
                                            {item.hasAccount ? (
                                                <>
                                                    {item.isActive ? (
                                                        <button
                                                            type="button"
                                                            className="admin-icon-button is-danger"
                                                            onClick={() => {
                                                                void deactivateAccount(item);
                                                            }}
                                                            disabled={isPending(`deactivate-${item.staffId}`)}
                                                        >
                                                            {isPending(`deactivate-${item.staffId}`) ? 'Deactivating...' : 'Deactivate'}
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="admin-icon-button is-edit"
                                                                onClick={() => {
                                                                    void reactivateAccount(item);
                                                                }}
                                                                disabled={isPending(`reactivate-${item.staffId}`)}
                                                            >
                                                                {isPending(`reactivate-${item.staffId}`) ? 'Reactivating...' : 'Reactivate'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="admin-icon-button"
                                                                onClick={() => {
                                                                    void unlockAccount(item);
                                                                }}
                                                                disabled={isPending(`unlock-${item.staffId}`)}
                                                            >
                                                                {isPending(`unlock-${item.staffId}`) ? 'Unlocking...' : 'Unlock'}
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="admin-icon-button"
                                                        onClick={() => {
                                                            void forcePasswordReset(item);
                                                        }}
                                                        disabled={isPending(`force-reset-${item.staffId}`)}
                                                    >
                                                        {isPending(`force-reset-${item.staffId}`) ? 'Sending...' : 'Force Reset'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-icon-button"
                                                        onClick={() => {
                                                            void resendInvite(item);
                                                        }}
                                                        disabled={isPending(`resend-invite-${item.staffId}`)}
                                                    >
                                                        {isPending(`resend-invite-${item.staffId}`) ? 'Resending...' : 'Resend Invite'}
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="admin-access-hint">Assign a role to create a linked account.</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <section className="admin-panel card">
                <div className="admin-panel-header">
                    <h3>Attention Queue</h3>
                </div>
                {attentionItems.length === 0 ? (
                    <div className="admin-empty-state">
                        <strong>No immediate access gaps.</strong>
                        <p>All visible records already have account, department, and rank information in place.</p>
                    </div>
                ) : (
                    <div className="admin-attention-grid">
                        {attentionItems.slice(0, 12).map((item) => (
                            <article className="admin-attention-card" key={item.staffId}>
                                <strong>{item.name}</strong>
                                <span>{item.staffNumber}</span>
                                <div className="admin-attention-tags">
                                    {!item.hasAccount ? <span className="admin-badge is-warning">No account</span> : null}
                                    {item.hasAccount && !item.isActive ? <span className="admin-badge is-rejected">Inactive</span> : null}
                                    {item.forcePasswordChange ? <span className="admin-badge is-warning">Reset required</span> : null}
                                    {!item.departmentName ? <span className="admin-badge is-neutral">No department</span> : null}
                                    {!item.rankName ? <span className="admin-badge is-neutral">No rank</span> : null}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}

function AdminReportsSection({ dashboard, staff, requests }) {
    const roleCounts = buildRoleCounts(staff.items);
    const requestRows = requests.map((item) => {
        const staffRecord = staff.items.find((staffItem) => staffItem.staffId === item.staffId);

        return {
            ...item,
            departmentName: staffRecord?.departmentName || 'Unassigned',
            rankName: staffRecord?.rankName || 'Unassigned',
            role: staffRecord?.role || 'No Account',
        };
    });
    const departmentRows = buildDepartmentReport(staff.items, requestRows);
    const linkedAccounts = staff.items.filter((item) => Boolean(item.role)).length;
    const structureCoverage = staff.items.filter((item) => item.departmentName && item.rankName).length;
    const topPendingRows = requestRows
        .filter((item) => item.pendingRequests > 0)
        .sort((left, right) => right.pendingRequests - left.pendingRequests || String(right.lastRequestAt).localeCompare(String(left.lastRequestAt)))
        .slice(0, 8);

    return (
        <>
            <AdminPageHeader
                title="Reports & Exports"
                subtitle="Use the current portal data to monitor access coverage, backlog pressure, and department-level activity."
                action={(
                    <div className="admin-report-actions">
                        <button
                            type="button"
                            className="admin-button admin-button-secondary"
                            onClick={() => downloadCsv('staff-directory.csv', buildStaffCsvRows(staff.items))}
                        >
                            Export Staff CSV
                        </button>
                        <button
                            type="button"
                            className="admin-button admin-button-primary"
                            onClick={() => downloadCsv('approval-queue.csv', buildRequestCsvRows(requestRows))}
                        >
                            Export Requests CSV
                        </button>
                    </div>
                )}
            />
            <div className="admin-dashboard-stats admin-report-stats">
                <div className="admin-dashboard-stat is-primary">
                    <div>
                        <h3>Active Staff</h3>
                        <strong>{dashboard.stats.staff}</strong>
                    </div>
                </div>
                <div className="admin-dashboard-stat is-warning">
                    <div>
                        <h3>Pending Approvals</h3>
                        <strong>{dashboard.stats.pending}</strong>
                    </div>
                </div>
                <div className="admin-dashboard-stat is-success">
                    <div>
                        <h3>Linked Accounts</h3>
                        <strong>{linkedAccounts}</strong>
                    </div>
                </div>
                <div className="admin-dashboard-stat is-neutral">
                    <div>
                        <h3>Profile Structure Ready</h3>
                        <strong>{structureCoverage}</strong>
                    </div>
                </div>
            </div>
            <section className="admin-panel card">
                <div className="admin-panel-header">
                    <h3>Role Coverage</h3>
                </div>
                <div className="admin-coverage-grid">
                    {Object.entries(roleCounts).map(([role, count]) => (
                        <div className="admin-coverage-card" key={role}>
                            <span>{role === 'None' ? 'No Account' : role}</span>
                            <strong>{count}</strong>
                        </div>
                    ))}
                </div>
            </section>
            <section className="admin-panel card">
                <div className="admin-panel-header">
                    <h3>Department Operations</h3>
                </div>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th>Staff</th>
                                <th>Pending Requests</th>
                                <th>Total Requests</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departmentRows.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="admin-empty-cell">No department reporting data is available.</td>
                                </tr>
                            ) : departmentRows.map((item) => (
                                <tr key={item.departmentName}>
                                    <td className="admin-cell-strong">{item.departmentName}</td>
                                    <td>{item.staffCount}</td>
                                    <td><span className={`admin-badge ${item.pendingRequests > 0 ? 'is-warning' : 'is-success'}`}>{item.pendingRequests}</span></td>
                                    <td>{item.totalRequests}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <section className="admin-panel card">
                <div className="admin-panel-header">
                    <h3>Approval Backlog</h3>
                </div>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Staff</th>
                                <th>Department</th>
                                <th>Pending</th>
                                <th>Last Request</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topPendingRows.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="admin-empty-cell">There are no pending request backlogs right now.</td>
                                </tr>
                            ) : topPendingRows.map((item) => (
                                <tr key={item.staffId}>
                                    <td>
                                        <div className="admin-cell-stack">
                                            <strong>{item.name}</strong>
                                            <span>{item.staffNumber}</span>
                                        </div>
                                    </td>
                                    <td>{item.departmentName}</td>
                                    <td><span className="admin-badge is-warning">{item.pendingRequests}</span></td>
                                    <td>{formatDateTime(item.lastRequestAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}

function buildRoleCounts(items) {
    return items.reduce((counts, item) => {
        const role = item.role || 'None';
        counts[role] = (counts[role] || 0) + 1;
        return counts;
    }, { Admin: 0, Moderator: 0, Staff: 0, None: 0 });
}

function buildRoleDrafts(items) {
    return items.reduce((drafts, item) => {
        drafts[item.staffId] = item.role || 'Staff';
        return drafts;
    }, {});
}

function buildDepartmentReport(staffItems, requestRows) {
    const byDepartment = new Map();

    staffItems.forEach((item) => {
        const key = item.departmentName || 'Unassigned';
        const current = byDepartment.get(key) || {
            departmentName: key,
            staffCount: 0,
            pendingRequests: 0,
            totalRequests: 0,
        };

        current.staffCount += 1;
        byDepartment.set(key, current);
    });

    requestRows.forEach((item) => {
        const key = item.departmentName || 'Unassigned';
        const current = byDepartment.get(key) || {
            departmentName: key,
            staffCount: 0,
            pendingRequests: 0,
            totalRequests: 0,
        };

        current.pendingRequests += Number(item.pendingRequests || 0);
        current.totalRequests += Number(item.totalRequests || 0);
        byDepartment.set(key, current);
    });

    return Array.from(byDepartment.values()).sort((left, right) => {
        if (right.pendingRequests !== left.pendingRequests) {
            return right.pendingRequests - left.pendingRequests;
        }

        return right.staffCount - left.staffCount;
    });
}

function buildStaffCsvRows(items) {
    return items.map((item) => ({
        'Staff Name': item.name,
        'PF Number': item.staffNumber,
        Email: item.email,
        Department: item.departmentName || '',
        Rank: item.rankName || '',
        Role: item.role || 'No Account',
    }));
}

function buildRequestCsvRows(items) {
    return items.map((item) => ({
        'Staff Name': item.name,
        'PF Number': item.staffNumber,
        Department: item.departmentName || '',
        Rank: item.rankName || '',
        Role: item.role || 'No Account',
        'Pending Requests': item.pendingRequests,
        'Total Requests': item.totalRequests,
        'Last Request At': item.lastRequestAt,
    }));
}

function downloadCsv(filename, rows) {
    if (!rows.length || typeof window === 'undefined') {
        return;
    }

    const headers = Object.keys(rows[0]);
    const lines = [
        headers.join(','),
        ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

function escapeCsvValue(value) {
    const stringValue = String(value ?? '');
    if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
}

export {
    AdminVerificationQueueSection,
    AdminAccountsRolesSection,
    AdminReportsSection,
};
