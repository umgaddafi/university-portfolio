import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPageHeader, Field } from '../../components/common/ui';
import { PortalNavIcon } from '../../components/icons/AppIcons';
import { usePendingAction } from '../../hooks/usePendingAction';
import { formatDateTime } from '../../utils/formatters';
import { AdminRequestsWorkspace } from './AdminRequestsWorkspace';
import { useConfirm } from '../../contexts/ConfirmContext';

const JOSTUM_API = import.meta.env.DEV ? '/jostum-api' : 'https://jostumservices.com/api';

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

function AdminStaffSection({ staff, onCreate, onUpdate, onDelete }) {
    const [filters, setFilters] = useState({ search: '', departmentId: '', rankId: '', role: '' });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingStaffId, setEditingStaffId] = useState(null);
    const [form, setForm] = useState({ first_name: '', last_name: '', email: '', staff_number: '', department_id: '', rank_id: '', staff_category_id: '', passport_url: '' });
    const [isSearchingStaff, setIsSearchingStaff] = useState(false);
    const [searchSuccessful, setSearchSuccessful] = useState(false);
    const [searchError, setSearchError] = useState('');
    const { isPending, runPending } = usePendingAction();
    const confirm = useConfirm();
    const selectedDepartment = staff.filters.departments.find((item) => String(item.id) === String(filters.departmentId));
    const selectedRank = staff.filters.ranks.find((item) => String(item.id) === String(filters.rankId));
    const isCreating = isPending('create-staff');
    const isUpdating = editingStaffId ? isPending(`update-staff-${editingStaffId}`) : false;
    const isSaving = isCreating || isUpdating;

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

    function openEditModal(item) {
        const matchedRank = staff.filters.ranks.find(r => r.id === item.rankId);
        setForm({
            first_name: item.firstName || '',
            last_name: item.lastName || '',
            email: item.email || '',
            staff_number: item.staffNumber || '',
            department_id: item.departmentId || '',
            rank_id: item.rankId || '',
            staff_category_id: matchedRank ? matchedRank.category_id : '',
            passport_url: item.profilePhotoUrl || '',
        });
        setEditingStaffId(item.staffId);
        setSearchSuccessful(true);
        setShowCreateModal(true);
    }

    function closeCreateModal() {
        setForm({ first_name: '', last_name: '', email: '', staff_number: '', department_id: '', rank_id: '', staff_category_id: '', passport_url: '' });
        setEditingStaffId(null);
        setSearchSuccessful(false);
        setShowCreateModal(false);
    }

    async function submitCreate(event) {
        event.preventDefault();
        
        let result;
        if (editingStaffId) {
            result = await runPending(`update-staff-${editingStaffId}`, () => onUpdate(editingStaffId, form));
        } else {
            result = await runPending('create-staff', () => onCreate(form));
        }

        if (result?.ok) {
            closeCreateModal();
        }
    }

    async function handleSearchStaff() {
        if (!form.staff_number) return;
        
        setIsSearchingStaff(true);
        setSearchError('');
        setSearchSuccessful(false);
        
        try {
            const response = await fetch(`${JOSTUM_API}/v1/staff/${form.staff_number}`);
            
            if (!response.ok) {
                throw new Error('Staff not found or API error.');
            }
            
            const result = await response.json();
            if (result && result.data) {
                let matchedDepartmentId = '';
                if (result.data.department) {
                    const matchedDept = staff.filters.departments.find(d => d.name.toLowerCase() === result.data.department.toLowerCase());
                    if (matchedDept) matchedDepartmentId = matchedDept.id;
                }

                let matchedRankId = '';
                let matchedRank = null;
                if (result.data.rank) {
                    matchedRank = staff.filters.ranks.find(r => r.name.toLowerCase() === result.data.rank.toLowerCase());
                    if (matchedRank) matchedRankId = matchedRank.id;
                }

                let matchedCategoryId = '';
                if (matchedRank) matchedCategoryId = matchedRank.category_id;

                setForm(current => ({
                    ...current,
                    first_name: result.data.first_name || '',
                    last_name: result.data.last_name || '',
                    email: result.data.email || current.email,
                    department_id: matchedDepartmentId || current.department_id,
                    rank_id: matchedRankId || current.rank_id,
                    staff_category_id: matchedCategoryId || current.staff_category_id,
                    passport_url: result.data.passport_url || current.passport_url,
                }));
                setSearchSuccessful(true);
            } else {
                throw new Error('Invalid data format received.');
            }
        } catch (error) {
            setSearchError(error.message || 'Failed to fetch staff details.');
        } finally {
            setIsSearchingStaff(false);
        }
    }

    return (
        <>
            <AdminPageHeader
                title="Staff Directory"
                action={(
                    <button type="button" className="admin-button admin-button-primary" onClick={() => { setEditingStaffId(null); setShowCreateModal(true); }}>
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
                                    <td className="is-right" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button
                                            type="button"
                                            className="admin-button-secondary"
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                                            onClick={() => openEditModal(item)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="admin-table-danger"
                                            onClick={async () => {
                                                await confirm({
                                                    title: 'Confirm Deletion',
                                                    message: `Delete ${item.name}? This action cannot be undone.`,
                                                    confirmText: 'Delete',
                                                    danger: true,
                                                    action: () => runPending(`delete-staff-${item.staffId}`, () => onDelete(item.staffId))
                                                });
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
                title={editingStaffId ? "Edit Staff" : "Add New Staff"}
                onClose={closeCreateModal}
                actions={(
                    <>
                        <button type="button" className="admin-button admin-button-secondary" onClick={closeCreateModal} disabled={isSaving}>Cancel</button>
                        <button type="submit" form="admin-staff-create-form" className="admin-button admin-button-primary" disabled={isSaving || isSearchingStaff || !searchSuccessful}>
                            {isSaving ? 'Saving...' : (editingStaffId ? 'Update Account' : 'Create Account')}
                        </button>
                    </>
                )}
            >
                <form id="admin-staff-create-form" className="admin-modal-form" onSubmit={submitCreate}>
                    {searchError && <div className="admin-form-error" style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{searchError}</div>}
                    <Field label="Staff Number (Search to auto-fill)">
                        <div style={{ position: 'relative', display: 'flex' }}>
                            <input 
                                className="input" 
                                value={form.staff_number} 
                                onChange={(event) => setForm((current) => ({ ...current, staff_number: event.target.value }))} 
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        handleSearchStaff();
                                    }
                                }}
                                required 
                                style={{ paddingRight: '3rem' }}
                            />
                            <button
                                type="button"
                                className="admin-icon-button"
                                onClick={handleSearchStaff}
                                disabled={isSearchingStaff || !form.staff_number}
                                style={{ position: 'absolute', right: '0.25rem', top: '50%', transform: 'translateY(-50%)', padding: '0.4rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
                                aria-label="Search staff details"
                                title="Search staff details"
                            >
                                {isSearchingStaff ? (
                                    <span style={{ fontSize: '0.8rem' }}>...</span>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </Field>
                    
                    {searchSuccessful && (
                        <>
                            {form.passport_url && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <img src={form.passport_url} alt="Staff Passport" style={{ width: '100px', height: '100px', objectFit: 'fill', borderRadius: '8px', border: '2px solid var(--border-light)' }} />
                                </div>
                            )}
                            
                            <div className="admin-modal-grid">
                                <Field label="First name"><input className="input" value={form.first_name} onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))} required /></Field>
                                <Field label="Last name"><input className="input" value={form.last_name} onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))} required /></Field>
                            </div>
                            <div className="admin-modal-grid">
                                <Field label="Email"><input className="input" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required /></Field>
                                <Field label="Staff Category">
                                    <select className="select" value={form.staff_category_id} onChange={(event) => setForm((current) => ({ ...current, staff_category_id: event.target.value, rank_id: '' }))}>
                                        <option value="">Select category</option>
                                        {staff.filters.categories?.map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>
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
                                    <select className="select" value={form.rank_id} onChange={(event) => setForm((current) => ({ ...current, rank_id: event.target.value }))} required disabled={!form.staff_category_id && staff.filters.categories?.length > 0}>
                                        <option value="">Select rank</option>
                                        {staff.filters.ranks
                                            .filter(rank => !form.staff_category_id || String(rank.category_id) === String(form.staff_category_id))
                                            .map((rank) => (
                                            <option key={rank.id} value={rank.id}>{rank.name}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>
                        </>
                    )}
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
    const confirm = useConfirm();
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
                                                onClick={async () => {
                                                    await confirm({
                                                        title: 'Confirm Deletion',
                                                        message: 'Delete this college/faculty? All associated departments will be affected.',
                                                        confirmText: 'Delete',
                                                        danger: true,
                                                        action: () => runPending(`delete-college-${item.id}`, () => onDelete(item.id))
                                                    });
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
    const confirm = useConfirm();
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
                                                onClick={async () => {
                                                    await confirm({
                                                        title: 'Confirm Deletion',
                                                        message: 'Delete this department? All associated records will be affected.',
                                                        confirmText: 'Delete',
                                                        danger: true,
                                                        action: () => runPending(`delete-department-${item.id}`, () => onDelete(item.id))
                                                    });
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
    const confirm = useConfirm();
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
                                                onClick={async () => {
                                                    await confirm({
                                                        title: 'Confirm Deletion',
                                                        message: 'Delete this rank? Staff with this rank will need to be updated.',
                                                        confirmText: 'Delete',
                                                        danger: true,
                                                        action: () => runPending(`delete-rank-${item.id}`, () => onDelete(item.id))
                                                    });
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

export function AdminPayslipSection() {
    const [file, setFile] = useState(null);
    const dummyData = [
        { month: 'April 2026', status: 'Pending Review', date: '2026-05-02' },
        { month: 'March 2026', status: 'Processed', date: '2026-04-01' },
        { month: 'February 2026', status: 'Processed', date: '2026-03-03' },
        { month: 'January 2026', status: 'Processed', date: '2026-02-05' },
    ];

    const handleUpload = (e) => {
        e.preventDefault();
        if (file) {
            alert(`Dummy upload initiated for: ${file.name}`);
        } else {
            alert('Please select an .xlsx file first.');
        }
    };

    return (
        <>
            <AdminPageHeader
                title="Payslip Management"
                subtitle="Upload and manage staff payroll data"
            />
            <section className="admin-panel card" style={{ marginBottom: '2rem' }}>
                <div className="admin-panel-header">
                    <h3>Upload New Payslip Data</h3>
                </div>
                <div className="admin-form-panel" style={{ padding: '1.5rem' }}>
                    <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1', minWidth: '250px' }}>
                            <label className="label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Payroll File (.xlsx)</label>
                            <input 
                                type="file" 
                                accept=".xlsx"
                                onChange={(e) => setFile(e.target.files[0])} 
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--line)', borderRadius: '4px' }}
                            />
                        </div>
                        <button type="submit" className="admin-button admin-button-primary" style={{ padding: '0.6rem 1.5rem', whiteSpace: 'nowrap' }}>
                            Upload Payslip
                        </button>
                    </form>
                    <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--muted)' }}>Only Excel workbooks (.xlsx) are accepted.</p>
                </div>
            </section>

            <section className="admin-panel card">
                <div className="admin-panel-header">
                    <h3>Payslip Upload History</h3>
                </div>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Payroll Month</th>
                                <th>Status</th>
                                <th>Date Uploaded</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dummyData.map((item, index) => (
                                <tr key={index}>
                                    <td><strong>{item.month}</strong></td>
                                    <td>
                                        <span className={`admin-badge ${item.status === 'Processed' ? 'is-approved' : 'is-pending'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>{item.date}</td>
                                    <td>
                                        <button className="admin-icon-button" style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }} title="View Details">👁</button>
                                        <button className="admin-icon-button" style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }} title="Delete">🗑</button>
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

export {
    AdminDashboardSection,
    AdminStaffSection,
    AdminRequestsSection,
    CollegeManager,
    DepartmentManager,
    RankManager,
};
