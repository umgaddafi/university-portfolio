import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPageHeader, Field } from '../../components/common/ui';
import { PortalNavIcon } from '../../components/icons/AppIcons';
import { usePendingAction } from '../../hooks/usePendingAction';
import { formatDateTime } from '../../utils/formatters';
import { AdminRequestsWorkspace } from './AdminRequestsWorkspace';

function AdminDashboardSection({ dashboard }) {
    const today = new Date().toLocaleDateString(undefined, { month: 'long', day: '2-digit', year: 'numeric' });
    const statCards = [
        { key: 'pending', label: 'Pending Requests', value: dashboard.stats.pending, icon: 'requests', tone: 'warning' },
        { key: 'staff', label: 'Active Staff', value: dashboard.stats.staff, icon: 'staff', tone: 'success' },
        { key: 'publications', label: 'Total Publications', value: dashboard.stats.publications, icon: 'publications', tone: 'primary' },
    ];

    return (
        <>
            <AdminPageHeader
                title="Dashboard Overview"
                subtitle="System Summary & Alerts"
                meta={<span className="admin-date-badge">{today}</span>}
            />
            <div className="admin-dashboard-stats">
                {statCards.map((item) => (
                    <div className={`admin-dashboard-stat is-${item.tone}`} key={item.key}>
                        <div>
                            <h3>{item.label}</h3>
                            <strong>{item.value}</strong>
                        </div>
                        <span className="admin-dashboard-stat-icon" aria-hidden="true">
                            <PortalNavIcon name={item.icon} />
                        </span>
                    </div>
                ))}
            </div>
            <section className="admin-panel card">
                <div className="admin-panel-header">
                    <h3>Pending Approval Queue</h3>
                </div>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Staff Name</th>
                                <th>Action Type</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboard.pendingQueue.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="admin-empty-cell">No pending items.</td>
                                </tr>
                            ) : dashboard.pendingQueue.map((item) => (
                                <tr key={item.logId}>
                                    <td className="admin-cell-strong">{item.staffName || 'Unknown staff'}</td>
                                    <td>Update {item.entityName}</td>
                                    <td>{formatDateTime(item.timestamp)}</td>
                                    <td><span className="admin-badge is-warning">Pending</span></td>
                                    <td>
                                        <Link className="admin-table-action" to="/admin/verifications">
                                            Review
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}

function AdminStaffSection({ staff, onCreate, onDelete }) {
    const [filters, setFilters] = useState({ search: '', departmentId: '', rankId: '', role: '' });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [form, setForm] = useState({ first_name: '', last_name: '', email: '', staff_number: '', department_id: '', rank_id: '' });
    const { isPending, runPending } = usePendingAction();
    const selectedDepartment = staff.filters.departments.find((item) => String(item.id) === String(filters.departmentId));
    const selectedRank = staff.filters.ranks.find((item) => String(item.id) === String(filters.rankId));
    const isCreating = isPending('create-staff');
    const filteredStaff = staff.items.filter((item) => {
        const searchValue = filters.search.trim().toLowerCase();
        const roleValue = item.role || 'NULL';

        if (searchValue && !`${item.name} ${item.email}`.toLowerCase().includes(searchValue)) {
            return false;
        }

        if (selectedDepartment && item.departmentName !== selectedDepartment.name) {
            return false;
        }

        if (selectedRank && item.rankName !== selectedRank.name) {
            return false;
        }

        if (filters.role && roleValue !== filters.role) {
            return false;
        }

        return true;
    });

    async function submitCreate(event) {
        event.preventDefault();
        const result = await runPending('create-staff', () => onCreate(form));
        if (result?.ok) {
            setForm({ first_name: '', last_name: '', email: '', staff_number: '', department_id: '', rank_id: '' });
            setShowCreateModal(false);
        }
    }

    return (
        <>
            <AdminPageHeader
                title="Staff Directory"
                action={(
                    <button type="button" className="admin-button admin-button-primary" onClick={() => setShowCreateModal(true)}>
                        Add New Staff
                    </button>
                )}
            />
            <section className="admin-filter-card card">
                <div className="admin-filter-grid is-staff">
                    <Field label="Search Name/Email">
                        <input
                            className="input"
                            value={filters.search}
                            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                            placeholder="Search..."
                        />
                    </Field>
                    <Field label="Department">
                        <select
                            className="select"
                            value={filters.departmentId}
                            onChange={(event) => setFilters((current) => ({ ...current, departmentId: event.target.value }))}
                        >
                            <option value="">All Depts</option>
                            {staff.filters.departments.map((department) => (
                                <option key={department.id} value={department.id}>{department.name}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Rank">
                        <select
                            className="select"
                            value={filters.rankId}
                            onChange={(event) => setFilters((current) => ({ ...current, rankId: event.target.value }))}
                        >
                            <option value="">All Ranks</option>
                            {staff.filters.ranks.map((rank) => (
                                <option key={rank.id} value={rank.id}>{rank.name}</option>
                            ))}
                        </select>
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
                    <div className="admin-filter-reset">
                        <button
                            type="button"
                            className="admin-button admin-button-secondary"
                            onClick={() => setFilters({ search: '', departmentId: '', rankId: '', role: '' })}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </section>
            <section className="admin-panel card">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name &amp; Email</th>
                                <th>Role</th>
                                <th>Rank</th>
                                <th>Department</th>
                                <th className="is-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="admin-empty-cell">No staff records found.</td>
                                </tr>
                            ) : filteredStaff.map((item) => (
                                <tr key={item.staffId}>
                                    <td>
                                        <div className="admin-cell-stack">
                                            <strong>{item.name}</strong>
                                            <span>{item.email}</span>
                                        </div>
                                    </td>
                                    <td>{item.role || 'No Account'}</td>
                                    <td>{item.rankName || 'N/A'}</td>
                                    <td>{item.departmentName || 'N/A'}</td>
                                    <td className="is-right">
                                        <button
                                            type="button"
                                            className="admin-table-danger"
                                            onClick={() => {
                                                if (!window.confirm(`Delete ${item.name}?`)) {
                                                    return;
                                                }

                                                void runPending(`delete-staff-${item.staffId}`, () => onDelete(item.staffId));
                                            }}
                                            disabled={isPending(`delete-staff-${item.staffId}`)}
                                        >
                                            {isPending(`delete-staff-${item.staffId}`) ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <AdminModal
                open={showCreateModal}
                title="Add New Staff"
                onClose={() => setShowCreateModal(false)}
                actions={(
                    <>
                        <button type="button" className="admin-button admin-button-secondary" onClick={() => setShowCreateModal(false)} disabled={isCreating}>Cancel</button>
                        <button type="submit" form="admin-staff-create-form" className="admin-button admin-button-primary" disabled={isCreating}>
                            {isCreating ? 'Creating...' : 'Create Account'}
                        </button>
                    </>
                )}
            >
                <form id="admin-staff-create-form" className="admin-modal-form" onSubmit={submitCreate}>
                    <div className="admin-modal-grid">
                        <Field label="First name"><input className="input" value={form.first_name} onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))} required /></Field>
                        <Field label="Last name"><input className="input" value={form.last_name} onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))} required /></Field>
                    </div>
                    <Field label="Email"><input className="input" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required /></Field>
                    <Field label="Staff number"><input className="input" value={form.staff_number} onChange={(event) => setForm((current) => ({ ...current, staff_number: event.target.value }))} required /></Field>
                    <div className="admin-modal-grid">
                        <Field label="Department">
                            <select className="select" value={form.department_id} onChange={(event) => setForm((current) => ({ ...current, department_id: event.target.value }))} required>
                                <option value="">Select department</option>
                                {staff.filters.departments.map((department) => (
                                    <option key={department.id} value={department.id}>{department.name}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Rank">
                            <select className="select" value={form.rank_id} onChange={(event) => setForm((current) => ({ ...current, rank_id: event.target.value }))} required>
                                <option value="">Select rank</option>
                                {staff.filters.ranks.map((rank) => (
                                    <option key={rank.id} value={rank.id}>{rank.name}</option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </form>
            </AdminModal>
        </>
    );
}

function AdminRequestsSection({ summary, reloadPortal, showFlash }) {
    return <AdminRequestsWorkspace summary={summary} reloadPortal={reloadPortal} showFlash={showFlash} />;
}

function CollegeManager({ items, onSave, onDelete }) {
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const { isPending, runPending } = usePendingAction();
    const isSaving = isPending('save-college');

    useEffect(() => {
        setName(editing?.name || '');
    }, [editing]);

    function openCreate() {
        setEditing(null);
        setName('');
        setShowModal(true);
    }

    async function submit(event) {
        event.preventDefault();
        const result = await runPending('save-college', () => onSave({ name }, editing?.id));
        if (result?.ok) {
            setEditing(null);
            setName('');
            setShowModal(false);
        }
    }

    return (
        <>
            <AdminPageHeader
                title="College / Faculty Management"
                action={<button type="button" className="admin-button admin-button-primary" onClick={openCreate}>Add College/Faculty</button>}
            />
            <section className="admin-panel card">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>College / Faculty Name</th>
                                <th className="is-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={2} className="admin-empty-cell">No colleges/faculties found.</td>
                                </tr>
                            ) : items.map((item) => (
                                <tr key={item.id}>
                                    <td className="admin-cell-strong">{item.name}</td>
                                    <td className="is-right">
                                        <div className="admin-table-actions">
                                            <button type="button" className="admin-icon-button is-edit" onClick={() => {
                                                setEditing(item);
                                                setShowModal(true);
                                            }}>Edit</button>
                                            <button
                                                type="button"
                                                className="admin-icon-button is-danger"
                                                onClick={() => {
                                                    if (!window.confirm('Delete this college/faculty?')) {
                                                        return;
                                                    }

                                                    void runPending(`delete-college-${item.id}`, () => onDelete(item.id));
                                                }}
                                                disabled={isPending(`delete-college-${item.id}`)}
                                            >
                                                {isPending(`delete-college-${item.id}`) ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <AdminModal
                open={showModal}
                title={editing ? 'Edit College/Faculty' : 'Add College/Faculty'}
                onClose={() => setShowModal(false)}
                actions={(
                    <>
                        <button type="button" className="admin-button admin-button-secondary" onClick={() => setShowModal(false)} disabled={isSaving}>Cancel</button>
                        <button type="submit" form="admin-college-form" className="admin-button admin-button-primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : (editing ? 'Update' : 'Save')}
                        </button>
                    </>
                )}
            >
                <form id="admin-college-form" className="admin-modal-form" onSubmit={submit}>
                    <Field label="College / Faculty Name">
                        <input className="input" value={name} onChange={(event) => setName(event.target.value)} required />
                    </Field>
                </form>
            </AdminModal>
        </>
    );
}

function DepartmentManager({ items, colleges, onSave, onDelete }) {
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', college_id: '' });
    const { isPending, runPending } = usePendingAction();
    const isSaving = isPending('save-department');

    useEffect(() => {
        setForm(editing ? { name: editing.name, college_id: String(editing.collegeId) } : { name: '', college_id: '' });
    }, [editing]);

    function openCreate() {
        setEditing(null);
        setForm({ name: '', college_id: '' });
        setShowModal(true);
    }

    async function submit(event) {
        event.preventDefault();
        const result = await runPending('save-department', () => onSave(form, editing?.id));
        if (result?.ok) {
            setEditing(null);
            setForm({ name: '', college_id: '' });
            setShowModal(false);
        }
    }

    return (
        <>
            <AdminPageHeader
                title="Department Management"
                action={<button type="button" className="admin-button admin-button-primary" onClick={openCreate}>Add Department</button>}
            />
            <section className="admin-panel card">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th>College</th>
                                <th className="is-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="admin-empty-cell">No departments found.</td>
                                </tr>
                            ) : items.map((item) => (
                                <tr key={item.id}>
                                    <td className="admin-cell-strong">{item.name}</td>
                                    <td>{item.collegeName || 'N/A'}</td>
                                    <td className="is-right">
                                        <div className="admin-table-actions">
                                            <button type="button" className="admin-icon-button is-edit" onClick={() => {
                                                setEditing(item);
                                                setShowModal(true);
                                            }}>Edit</button>
                                            <button
                                                type="button"
                                                className="admin-icon-button is-danger"
                                                onClick={() => {
                                                    if (!window.confirm('Delete this department?')) {
                                                        return;
                                                    }

                                                    void runPending(`delete-department-${item.id}`, () => onDelete(item.id));
                                                }}
                                                disabled={isPending(`delete-department-${item.id}`)}
                                            >
                                                {isPending(`delete-department-${item.id}`) ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <AdminModal
                open={showModal}
                title={editing ? 'Edit Department' : 'Add Department'}
                onClose={() => setShowModal(false)}
                actions={(
                    <>
                        <button type="button" className="admin-button admin-button-secondary" onClick={() => setShowModal(false)} disabled={isSaving}>Cancel</button>
                        <button type="submit" form="admin-department-form" className="admin-button admin-button-primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : (editing ? 'Update Department' : 'Save Department')}
                        </button>
                    </>
                )}
            >
                <form id="admin-department-form" className="admin-modal-form" onSubmit={submit}>
                    <Field label="College">
                        <select className="select" value={form.college_id} onChange={(event) => setForm((current) => ({ ...current, college_id: event.target.value }))} required>
                            <option value="">Select College</option>
                            {colleges.map((college) => (
                                <option key={college.id} value={college.id}>{college.name}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Department Name">
                        <input className="input" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
                    </Field>
                </form>
            </AdminModal>
        </>
    );
}

function RankManager({ items, onSave, onDelete }) {
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ rank_name: '', rank_level: 0 });
    const { isPending, runPending } = usePendingAction();
    const isSaving = isPending('save-rank');

    useEffect(() => {
        setForm(editing ? { rank_name: editing.name, rank_level: editing.level } : { rank_name: '', rank_level: 0 });
    }, [editing]);

    function openCreate() {
        setEditing(null);
        setForm({ rank_name: '', rank_level: 0 });
        setShowModal(true);
    }

    async function submit(event) {
        event.preventDefault();
        const result = await runPending('save-rank', () => onSave(form, editing?.id));
        if (result?.ok) {
            setEditing(null);
            setForm({ rank_name: '', rank_level: 0 });
            setShowModal(false);
        }
    }

    return (
        <>
            <AdminPageHeader
                title="Academic Rank Management"
                action={<button type="button" className="admin-button admin-button-primary" onClick={openCreate}>Add Rank</button>}
            />
            <section className="admin-panel card">
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Rank Name</th>
                                <th>Level</th>
                                <th className="is-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="admin-empty-cell">No ranks found.</td>
                                </tr>
                            ) : items.map((item) => (
                                <tr key={item.id}>
                                    <td className="admin-cell-strong">{item.name}</td>
                                    <td><span className="admin-badge is-neutral">Level {item.level}</span></td>
                                    <td className="is-right">
                                        <div className="admin-table-actions">
                                            <button type="button" className="admin-icon-button is-edit" onClick={() => {
                                                setEditing(item);
                                                setShowModal(true);
                                            }}>Edit</button>
                                            <button
                                                type="button"
                                                className="admin-icon-button is-danger"
                                                onClick={() => {
                                                    if (!window.confirm('Delete this rank?')) {
                                                        return;
                                                    }

                                                    void runPending(`delete-rank-${item.id}`, () => onDelete(item.id));
                                                }}
                                                disabled={isPending(`delete-rank-${item.id}`)}
                                            >
                                                {isPending(`delete-rank-${item.id}`) ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <AdminModal
                open={showModal}
                title={editing ? 'Edit Academic Rank' : 'Add Academic Rank'}
                onClose={() => setShowModal(false)}
                actions={(
                    <>
                        <button type="button" className="admin-button admin-button-secondary" onClick={() => setShowModal(false)} disabled={isSaving}>Cancel</button>
                        <button type="submit" form="admin-rank-form" className="admin-button admin-button-primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : (editing ? 'Update Rank' : 'Save Rank')}
                        </button>
                    </>
                )}
            >
                <form id="admin-rank-form" className="admin-modal-form" onSubmit={submit}>
                    <Field label="Rank Name">
                        <input className="input" value={form.rank_name} onChange={(event) => setForm((current) => ({ ...current, rank_name: event.target.value }))} required />
                    </Field>
                    <Field label="Rank Level">
                        <input className="input" type="number" min="0" value={form.rank_level} onChange={(event) => setForm((current) => ({ ...current, rank_level: event.target.value }))} required />
                    </Field>
                </form>
            </AdminModal>
        </>
    );
}

export {
    AdminAccountsRolesSection,
    AdminReportsSection,
    AdminVerificationQueueSection,
} from './AdminOperationsSections';

export {
    AdminDashboardSection,
    AdminStaffSection,
    AdminRequestsSection,
    CollegeManager,
    DepartmentManager,
    RankManager,
};
