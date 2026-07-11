import { useLocation } from 'react-router-dom';
import { ErrorState, LoadingScreen } from '../../components/common/states';
import { PortalShell } from '../../components/layouts/PortalShell';
import { usePortalResource } from '../../hooks/usePortalResource';
import { api } from '../../lib/api';
import { getErrorMessage } from '../../utils/formatters';
import {
    AdminAccountsRolesSection,
    AdminReportsSection,
    AdminVerificationQueueSection,
    AdminDashboardSection,
    AdminRequestsSection,
    AdminStaffSection,
    CollegeManager,
    DepartmentManager,
    RankManager,
} from './AdminSections';

function formatMutationMessage(result) {
    const message = result.message || 'Saved successfully.';

    if (result.temporaryPassword) {
        const usernameSuffix = result.username ? ` Username: ${result.username}.` : '';
        return `${message}${usernameSuffix} Temporary password: ${result.temporaryPassword}.`;
    }

    return message;
}

function AdminPortalPage({ user, onLogout, showFlash }) {
    const location = useLocation();
    const section = location.pathname.split('/')[2] || 'dashboard';
    const { data, loading, error, load } = usePortalResource('/api/admin/portal');

    const navSections = [
        {
            title: 'Overview',
            items: [
                { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
            ],
        },
        {
            title: 'Operations',
            items: [
                { to: '/admin/requests', label: 'Approval Workspace', navLabel: 'Approval Workspace', icon: 'requests' },
                { to: '/admin/verifications', label: 'Pending Verifications', navLabel: 'Pending Verifications', icon: 'operations' },
                { to: '/admin/reports', label: 'Reports & Exports', navLabel: 'Reports & Exports', icon: 'reports' },
            ],
        },
        {
            title: 'People & Access',
            items: [
                { to: '/admin/staff', label: 'Staff Directory', navLabel: 'Staff Directory', icon: 'staff' },
                { to: '/admin/access', label: 'User Accounts & Roles', navLabel: 'User Accounts & Roles', icon: 'roles' },
            ],
        },
        {
            title: 'Academic Structure',
            items: [
                { to: '/admin/colleges', label: 'Colleges / Faculties', navLabel: 'Colleges / Faculties', icon: 'colleges' },
                { to: '/admin/departments', label: 'Departments', icon: 'departments' },
                { to: '/admin/ranks', label: 'Academic Ranks', navLabel: 'Academic Ranks', icon: 'ranks' },
            ],
        },
    ];
    const navItems = navSections.flatMap((sectionItem) => sectionItem.items);

    async function mutate(path, options) {
        try {
            const result = await api(path, options);
            showFlash(formatMutationMessage(result));
            await load();
            return { ok: true, result };
        } catch (mutationError) {
            showFlash(getErrorMessage(mutationError), 'error');
            return { ok: false, error: mutationError };
        }
    }

    if (loading || !data) {
        if (loading) {
            return <LoadingScreen label="Loading admin portal..." />;
        }

        return <ErrorState title="Admin portal unavailable." message={error} onRetry={load} fullScreen />;
    }

    let content = null;

    if (section === 'dashboard') {
        content = <AdminDashboardSection dashboard={data.dashboard} />;
    } else if (section === 'staff') {
        content = <AdminStaffSection 
            staff={data.staff} 
            onCreate={(payload) => mutate('/api/admin/staff', { method: 'POST', data: payload })} 
            onUpdate={(staffId, payload) => mutate(`/api/admin/staff/${staffId}`, { method: 'PUT', data: payload })} 
            onDelete={(staffId) => mutate(`/api/admin/staff/${staffId}`, { method: 'DELETE' })} 
        />;
    } else if (section === 'requests') {
        content = <AdminRequestsSection summary={data.requests} reloadPortal={load} showFlash={showFlash} />;
    } else if (section === 'verifications') {
        content = <AdminVerificationQueueSection summary={data.requests} reloadPortal={load} showFlash={showFlash} />;
    } else if (section === 'access') {
        content = (
            <AdminAccountsRolesSection
                staff={data.staff}
                onAssignRole={(staffId, role) => mutate(`/api/admin/staff/${staffId}/role`, { method: 'POST', data: { role } })}
                onDeactivate={(staffId) => mutate(`/api/admin/staff/${staffId}/deactivate`, { method: 'POST' })}
                onReactivate={(staffId) => mutate(`/api/admin/staff/${staffId}/reactivate`, { method: 'POST' })}
                onForcePasswordReset={(staffId) => mutate(`/api/admin/staff/${staffId}/force-password-reset`, { method: 'POST' })}
                onResendInvite={(staffId) => mutate(`/api/admin/staff/${staffId}/resend-invite`, { method: 'POST' })}
                onUnlock={(staffId) => mutate(`/api/admin/staff/${staffId}/unlock`, { method: 'POST' })}
            />
        );
    } else if (section === 'reports') {
        content = <AdminReportsSection dashboard={data.dashboard} staff={data.staff} requests={data.requests} />;
    } else if (section === 'colleges') {
        content = <CollegeManager items={data.colleges} onSave={(payload, id) => mutate(id ? `/api/admin/colleges/${id}` : '/api/admin/colleges', { method: id ? 'PUT' : 'POST', data: payload })} onDelete={(id) => mutate(`/api/admin/colleges/${id}`, { method: 'DELETE' })} />;
    } else if (section === 'departments') {
        content = <DepartmentManager items={data.departments} colleges={data.colleges} onSave={(payload, id) => mutate(id ? `/api/admin/departments/${id}` : '/api/admin/departments', { method: id ? 'PUT' : 'POST', data: payload })} onDelete={(id) => mutate(`/api/admin/departments/${id}`, { method: 'DELETE' })} />;
    } else {
        content = <RankManager items={data.ranks} onSave={(payload, id) => mutate(id ? `/api/admin/ranks/${id}` : '/api/admin/ranks', { method: id ? 'PUT' : 'POST', data: payload })} onDelete={(id) => mutate(`/api/admin/ranks/${id}`, { method: 'DELETE' })} />;
    }

    return (
        <PortalShell
            user={user}
            navItems={navItems}
            navSections={navSections}
            title="Admin Portal"
            onLogout={onLogout}
            variant="admin"
            adminTopbar={{
                brandLabel: 'ADMIN PORTAL',
                homeTo: '/admin',
                name: user.name || 'Administrator',
                initials: 'A',
            }}
        >
            {content}
        </PortalShell>
    );
}

export { AdminPortalPage };
