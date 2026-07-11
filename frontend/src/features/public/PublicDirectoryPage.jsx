import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import jostumGate from '../../assets/jostumgate.png';
import jostumHall from '../../assets/jostumhall.png';
import jostumStudents from '../../assets/jostumstudents.png';
import { Avatar, EmptyState, ErrorState, LoadingScreen } from '../../components/common/states';
import { PublicLayout } from '../../components/layouts/PublicLayout';
import { useStaffDepartmentOptions } from '../../hooks/useStaffDepartmentOptions';
import { api } from '../../lib/api';
import { getErrorMessage } from '../../utils/formatters';

function PublicDirectoryPage({ user }) {
    const [directory, setDirectory] = useState({ items: [], filters: { faculties: [], departments: [], ranks: [], categories: [] } });
    const [filters, setFilters] = useState({ search: '', category: '', faculty: '', department: '', rank: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [retryKey, setRetryKey] = useState(0);


    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError('');

            try {
                const result = await api('/api/public/staff');
                if (!cancelled) {
                    setDirectory(result);
                }
            } catch (loadError) {
                if (!cancelled) {
                    setError(getErrorMessage(loadError));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, [retryKey]);

    const normalizedSearch = filters.search.trim().toLowerCase();
    const departmentOptions = directory.filters.departments || [];
    const availableDepartments = departmentOptions.filter((department) => (
        filters.faculty === ''
            || directory.items.some((item) => item.faculty === filters.faculty && item.department === department)
    ));
    const visibleItems = [...directory.items]
        .filter((item) => {
            const matchesSearch = normalizedSearch === ''
                || item.name.toLowerCase().includes(normalizedSearch)
                || item.role.toLowerCase().includes(normalizedSearch);
            const matchesFaculty = filters.faculty === '' || item.faculty === filters.faculty;
            const matchesDepartment = filters.department === '' || item.department === filters.department;
            const matchesRank = filters.rank === '' || item.role === filters.rank;
            const matchesCategory = filters.category === '' || item.category === filters.category;

            return matchesSearch && matchesFaculty && matchesDepartment && matchesRank && matchesCategory;
        });

    return (
        <PublicLayout user={user} fullWidth>
            <section className="directory-hero-section">
                <div className="directory-hero-slides" aria-hidden="true">
                    <div className="directory-hero-slide" style={{ backgroundImage: `url(${jostumGate})`, animationDelay: '0s' }} />
                    <div className="directory-hero-slide" style={{ backgroundImage: `url(${jostumHall})`, animationDelay: '6s' }} />
                    <div className="directory-hero-slide" style={{ backgroundImage: `url(${jostumStudents})`, animationDelay: '12s' }} />
                </div>
                <div className="directory-hero-overlay" aria-hidden="true" />
                <div className="directory-hero-content">
                    <div className="directory-hero-copy">
                        <h2 className="directory-page-title">Academic Staff Directory</h2>
                        <p className="directory-hero-subtitle">
                            Explore our professors, researchers, and leaders across faculties and departments.
                        </p>
                        <div className="directory-hero-badges">
                            <span>Research</span>
                            <span>Teaching</span>
                            <span>Innovation</span>
                            <span>Service</span>
                        </div>
                        <div className="directory-hero-actions">
                            <a className="directory-hero-action is-primary" href="#staffGrid">Browse Staff</a>
                            <a className="directory-hero-action is-secondary" href="#filterTools">Filter &amp; Sort</a>
                        </div>
                    </div>
                    <div className="directory-hero-stats">
                        <div className="directory-hero-stat-card">
                            <p className="directory-hero-stat-value">{directory.items.length}</p>
                            <div className="directory-hero-stat-label">Active Staff</div>
                        </div>
                        <div className="directory-hero-stat-card">
                            <p className="directory-hero-stat-value">{directory.filters.faculties.length}</p>
                            <div className="directory-hero-stat-label">Faculties</div>
                        </div>
                        <div className="directory-hero-stat-card">
                            <p className="directory-hero-stat-value">{directory.filters.departments?.length || 0}</p>
                            <div className="directory-hero-stat-label">Departments</div>
                        </div>
                        <div className="directory-hero-stat-card">
                            <p className="directory-hero-stat-value">24/7</p>
                            <div className="directory-hero-stat-label">Directory Access</div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="public-shell public-shell-directory">
                <div className="directory-filter-container" id="filterTools">
                    <div className="directory-filter-bar">
                        <div className="directory-filter-grid">
                            <div className="field directory-filter-search">
                                <input
                                    className="input"
                                    value={filters.search}
                                    onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                                    placeholder="Search name or role..."
                                />
                            </div>
                            <div className="field directory-filter-category">
                                <select
                                    className="select"
                                    value={filters.category}
                                    onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
                                >
                                    <option value="">Category...</option>
                                    {(directory.filters.categories || []).map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="field directory-filter-faculty">
                                <select
                                    className="select"
                                    value={filters.faculty}
                                    onChange={(event) => setFilters((current) => ({
                                        ...current,
                                        faculty: event.target.value,
                                        department: '',
                                    }))}
                                >
                                    <option value="">All Faculties</option>
                                    {directory.filters.faculties.map((faculty) => (
                                        <option key={faculty} value={faculty}>
                                            {faculty}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="field directory-filter-department">
                                <select
                                    className="select"
                                    value={filters.department}
                                    onChange={(event) => setFilters((current) => ({ ...current, department: event.target.value }))}
                                >
                                    <option value="">All Depts</option>
                                    {availableDepartments.map((department) => (
                                        <option key={department} value={department}>
                                            {department}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="field directory-filter-sort">
                                <select
                                    className="select"
                                    value={filters.rank}
                                    onChange={(event) => setFilters((current) => ({ ...current, rank: event.target.value }))}
                                >
                                    <option value="">Rank...</option>
                                    {(directory.filters.ranks || []).map((rank) => (
                                        <option key={rank} value={rank}>
                                            {rank}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="directory-feedback">
                        <LoadingScreen label="Loading staff directory..." compact />
                    </div>
                ) : error ? (
                    <div className="directory-feedback">
                        <ErrorState
                            title="Directory unavailable."
                            message={error}
                            onRetry={() => setRetryKey((current) => current + 1)}
                        />
                    </div>
                ) : visibleItems.length === 0 ? (
                    <div className="directory-feedback" id="staffGrid">
                        <EmptyState title="No staff members found matching your criteria." copy="Try broadening the faculty or department filters." />
                    </div>
                ) : (
                    <div className="directory-staff-grid" id="staffGrid">
                        {visibleItems.map((item) => (
                            <Link className="directory-staff-card" key={item.staffId} to={`/portfolio/${item.staffId}`}>
                                <div className="directory-staff-image-wrap">
                                    <Avatar name={item.name} photoUrl={item.profilePhotoUrl} className="directory-staff-image" />
                                </div>
                                <div className="directory-staff-card-body">
                                    <span className="directory-staff-role">{item.role || 'Academic Staff'}</span>
                                    <h3 className="directory-staff-name">{item.name}</h3>
                                    <div className="directory-staff-department">{item.department}</div>
                                </div>
                                <div className="directory-staff-link">View Profile</div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}

export { PublicDirectoryPage };
