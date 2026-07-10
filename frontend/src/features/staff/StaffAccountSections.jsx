import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../../components/common/states';
import { Field } from '../../components/common/ui';
import { usePendingAction } from '../../hooks/usePendingAction';
import { formatDateTime } from '../../utils/formatters';
import { StaffPageHeader } from './StaffShared';

function SettingsSection({ staff, user, notifications, onChangePassword, onMarkAllNotificationsRead, onDownloadCv }) {
    const [form, setForm] = useState({ new_password: '', new_password_confirmation: '' });
    const { isPending, runPending } = usePendingAction();
    const unreadCount = notifications?.unreadCount || 0;
    const staffId = user?.staffId || staff?.staff_id;
    const isSavingPassword = isPending('password');
    const isMarkingNotifications = isPending('notifications');

    async function submit(event) {
        event.preventDefault();

        if (form.new_password !== form.new_password_confirmation) {
            window.alert('The password confirmation does not match.');
            return;
        }

        const result = await runPending('password', () => onChangePassword(form));

        if (result?.ok) {
            setForm({ new_password: '', new_password_confirmation: '' });
        }
    }

    return (
        <>
            <StaffPageHeader
                title="Settings"
                copy="Manage password security, notifications, and portfolio shortcuts."
            />
            <div className="staff-settings-layout">
                <section className="staff-settings-card">
                    <div className="staff-form-section-head">
                        <h3>Account Overview</h3>
                        <p>Your linked portal account and profile details.</p>
                    </div>
                    <div className="staff-settings-grid">
                        <div>
                            <span>Username</span>
                            <strong>{user?.username || 'Not available'}</strong>
                        </div>
                        <div>
                            <span>Role</span>
                            <strong>{user?.role || 'Staff'}</strong>
                        </div>
                        <div>
                            <span>Staff Number</span>
                            <strong>{staff?.staff_number || 'Not assigned'}</strong>
                        </div>
                        <div>
                            <span>Official Email</span>
                            <strong>{staff?.email || 'Not available'}</strong>
                        </div>
                        <div>
                            <span>Department</span>
                            <strong>{staff?.department_name || 'Not set'}</strong>
                        </div>
                        <div>
                            <span>Rank</span>
                            <strong>{staff?.rank_name || 'Not set'}</strong>
                        </div>
                    </div>
                </section>

                <section className="staff-settings-card">
                    <div className="staff-form-section-head">
                        <h3>Change Password</h3>
                        <p>Update your sign-in password for the staff portal.</p>
                    </div>
                    <form className="staff-settings-form" onSubmit={submit}>
                        <Field label="New Password">
                            <input
                                className="input"
                                type="password"
                                value={form.new_password}
                                onChange={(event) => setForm((current) => ({ ...current, new_password: event.target.value }))}
                                minLength={8}
                                required
                            />
                        </Field>
                        <Field label="Confirm New Password">
                            <input
                                className="input"
                                type="password"
                                value={form.new_password_confirmation}
                                onChange={(event) => setForm((current) => ({ ...current, new_password_confirmation: event.target.value }))}
                                minLength={8}
                                required
                            />
                        </Field>
                        <button type="submit" className="staff-button staff-button-primary" disabled={isSavingPassword}>
                            {isSavingPassword ? 'Updating Password...' : 'Update Password'}
                        </button>
                    </form>
                </section>

                <section className="staff-settings-card">
                    <div className="staff-form-section-head">
                        <h3>Notifications</h3>
                        <p>Manage your pending alerts and review updates.</p>
                    </div>
                    <div className="staff-settings-inline">
                        <div className="staff-settings-metric">
                            <strong>{unreadCount}</strong>
                            <span>Unread notification{unreadCount === 1 ? '' : 's'}</span>
                        </div>
                        <button
                            type="button"
                            className="staff-button staff-button-secondary"
                            onClick={() => runPending('notifications', onMarkAllNotificationsRead)}
                            disabled={unreadCount === 0 || isMarkingNotifications}
                        >
                            {isMarkingNotifications ? 'Please wait...' : 'Mark All as Read'}
                        </button>
                    </div>
                </section>

                <section className="staff-settings-card">
                    <div className="staff-form-section-head">
                        <h3>Portfolio Shortcuts</h3>
                        <p>Quick links for your public and internal profile views.</p>
                    </div>
                    <div className="staff-settings-actions">
                        <Link className="staff-button staff-button-secondary" to={`/portfolio/${staffId}`} target="_blank" rel="noreferrer">
                            Public View
                        </Link>
                        <Link className="staff-button staff-button-secondary" to={`/portfolio/${staffId}?private=1`} target="_blank" rel="noreferrer">
                            Private View
                        </Link>
                        <button type="button" className="staff-button staff-button-primary" onClick={onDownloadCv}>
                            Download CV
                        </button>
                    </div>
                </section>
            </div>
        </>
    );
}

function IdCardSection({ staff, idCard, onRequestCard }) {
    const [form, setForm] = useState({ request_type: 'Replacement', reason: '' });
    const { isPending, runPending } = usePendingAction();
    const latestRequest = idCard?.latestRequest || null;
    const recentRequests = idCard?.recentRequests || [];
    const displayName = staff?.full_name || [staff?.title, staff?.first_name, staff?.last_name].filter(Boolean).join(' ') || 'Staff Member';
    const isSubmitting = isPending('request-id-card');

    async function submit(event) {
        event.preventDefault();
        const result = await runPending('request-id-card', () => onRequestCard(form));

        if (result?.ok) {
            setForm({ request_type: 'Replacement', reason: '' });
        }
    }

    return (
        <>
            <StaffPageHeader
                title="ID Card"
                copy="Preview your profile-based staff card and request a fresh print when needed."
            />
            <div className="staff-id-layout">
                <section className="staff-id-preview-shell">
                    <div className="staff-id-preview-note">Live sample generated from your current profile data.</div>
                    <div className="staff-id-card">
                        <div className="staff-id-card-head">
                            <div className="staff-id-brand">
                                <strong>JOSEPH SARWUAN TARKA UNIVERSITY</strong>
                                <span>Official Staff Identity Card</span>
                            </div>
                            <span className="staff-id-chip">STAFF</span>
                        </div>
                        <div className="staff-id-card-body">
                            <Avatar name={displayName} photoUrl={staff?.profile_photo_url} className="staff-id-avatar" />
                            <div className="staff-id-card-copy">
                                <h3>{displayName}</h3>
                                <p>{staff?.rank_name || 'Academic Staff'}</p>
                                <div className="staff-id-card-meta">
                                    <div>
                                        <span>Staff No</span>
                                        <strong>{staff?.staff_number || 'Pending'}</strong>
                                    </div>
                                    <div>
                                        <span>Department</span>
                                        <strong>{staff?.department_name || 'Not set'}</strong>
                                    </div>
                                    <div>
                                        <span>Email</span>
                                        <strong>{staff?.email || 'Not available'}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="staff-id-card-foot">
                            <span>{staff?.college_name || 'College not set'}</span>
                            <span>{staff?.phone || 'Update your phone in profile'}</span>
                        </div>
                    </div>
                </section>

                <section className="staff-id-request-card">
                    <div className="staff-form-section-head">
                        <h3>Request New Card</h3>
                        <p>Submit a new issue, replacement, correction, or renewal request.</p>
                    </div>
                    <form className="staff-settings-form" onSubmit={submit}>
                        <Field label="Request Type">
                            <select
                                className="select"
                                value={form.request_type}
                                onChange={(event) => setForm((current) => ({ ...current, request_type: event.target.value }))}
                                required
                            >
                                <option value="New Card">New Card</option>
                                <option value="Replacement">Replacement</option>
                                <option value="Correction">Correction</option>
                                <option value="Renewal">Renewal</option>
                            </select>
                        </Field>
                        <Field label="Reason / Notes">
                            <textarea
                                className="textarea"
                                rows={5}
                                value={form.reason}
                                onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                                placeholder="Explain why you need a fresh card."
                                required
                            />
                        </Field>
                        <button type="submit" className="staff-button staff-button-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
                        </button>
                    </form>

                    <div className="staff-id-status-box">
                        <strong>Latest Request</strong>
                        {latestRequest ? (
                            <>
                                <div className="staff-id-status-head">
                                    <span>{latestRequest.requestType}</span>
                                    <span className={`staff-status-pill is-${String(latestRequest.status || '').toLowerCase()}`}>{latestRequest.status}</span>
                                </div>
                                <p>{latestRequest.reason}</p>
                                <small>Submitted {formatDateTime(latestRequest.requestedAt)}</small>
                                {latestRequest.adminComment ? <small>Admin note: {latestRequest.adminComment}</small> : null}
                            </>
                        ) : (
                            <p>No ID card requests submitted yet.</p>
                        )}
                    </div>
                </section>
            </div>

            <section className="staff-id-history-card">
                <div className="staff-form-section-head">
                    <h3>Recent Card Requests</h3>
                    <p>Your latest submissions and their current status.</p>
                </div>
                {recentRequests.length === 0 ? (
                    <div className="staff-empty-inline">No card request history yet.</div>
                ) : (
                    <div className="staff-id-request-list">
                        {recentRequests.map((request) => (
                            <article className="staff-id-request-item" key={request.requestId}>
                                <div>
                                    <strong>{request.requestType}</strong>
                                    <p>{request.reason}</p>
                                    <small>{formatDateTime(request.requestedAt)}</small>
                                </div>
                                <div className="staff-id-request-side">
                                    <span className={`staff-status-pill is-${String(request.status || '').toLowerCase()}`}>{request.status}</span>
                                    {request.adminComment ? <small>{request.adminComment}</small> : null}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}

export { SettingsSection, IdCardSection };
