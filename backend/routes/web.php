<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\StaffController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name'),
        'status' => 'ok',
    ]);
});

Route::prefix('api')->group(function (): void {
    Route::get('/bootstrap', [AuthController::class, 'bootstrap']);

    Route::prefix('auth')->group(function (): void {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('legacy.auth');
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::get('/reset-password/{token}', [AuthController::class, 'validateResetToken']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        Route::post('/change-password', [AuthController::class, 'changePassword'])->middleware('legacy.auth');
    });

    Route::prefix('public')->group(function (): void {
        Route::get('/staff', [PublicController::class, 'directory']);
        Route::get('/staff/{staffId}', [PublicController::class, 'profile']);
    });

    Route::prefix('staff')
        ->middleware(['legacy.auth', 'legacy.role:Staff', 'legacy.password'])
        ->group(function (): void {
            Route::get('/portal', [StaffController::class, 'portal']);
            Route::post('/profile', [StaffController::class, 'updateProfile']);

            Route::post('/qualifications', [StaffController::class, 'createQualification']);
            Route::delete('/qualifications/{qualificationId}', [StaffController::class, 'deleteQualification']);

            Route::post('/research-areas', [StaffController::class, 'createResearchArea']);
            Route::delete('/research-areas/{researchAreaId}', [StaffController::class, 'deleteResearchArea']);

            Route::post('/publications', [StaffController::class, 'savePublication']);
            Route::delete('/publications/{publicationId}', [StaffController::class, 'deletePublication']);

            Route::post('/courses', [StaffController::class, 'linkCourse']);
            Route::delete('/courses', [StaffController::class, 'unlinkCourse']);

            Route::post('/grants', [StaffController::class, 'createGrant']);
            Route::delete('/grants/{projectId}', [StaffController::class, 'deleteGrant']);

            Route::post('/supervisions', [StaffController::class, 'createSupervision']);
            Route::delete('/supervisions/{supervisionId}', [StaffController::class, 'deleteSupervision']);

            Route::post('/memberships', [StaffController::class, 'createMembership']);
            Route::delete('/memberships/{membershipId}', [StaffController::class, 'deleteMembership']);

            Route::post('/external-profiles', [StaffController::class, 'createExternalProfile']);
            Route::delete('/external-profiles/{profileId}', [StaffController::class, 'deleteExternalProfile']);

            Route::post('/id-card/request', [StaffController::class, 'requestIdCard']);

            Route::post('/notifications/read-all', [StaffController::class, 'markAllNotificationsRead']);
            Route::post('/notifications/{notificationId}/read', [StaffController::class, 'markNotificationRead']);
        });

    Route::prefix('admin')
        ->middleware(['legacy.auth', 'legacy.role:Admin,Moderator', 'legacy.password'])
        ->group(function (): void {
            Route::get('/portal', [AdminController::class, 'portal']);
            Route::post('/staff', [AdminController::class, 'createStaff']);
            Route::put('/staff/{staffId}', [AdminController::class, 'updateStaff']);
            Route::post('/staff/{staffId}/role', [AdminController::class, 'assignStaffRole']);
            Route::post('/staff/{staffId}/deactivate', [AdminController::class, 'deactivateStaffAccount']);
            Route::post('/staff/{staffId}/reactivate', [AdminController::class, 'reactivateStaffAccount']);
            Route::post('/staff/{staffId}/force-password-reset', [AdminController::class, 'forceStaffPasswordReset']);
            Route::post('/staff/{staffId}/resend-invite', [AdminController::class, 'resendStaffInvite']);
            Route::post('/staff/{staffId}/unlock', [AdminController::class, 'unlockStaffAccount']);
            Route::delete('/staff/{staffId}', [AdminController::class, 'deleteStaff']);

            Route::post('/colleges', [AdminController::class, 'saveCollege']);
            Route::put('/colleges/{collegeId}', [AdminController::class, 'saveCollege']);
            Route::delete('/colleges/{collegeId}', [AdminController::class, 'deleteCollege']);

            Route::post('/departments', [AdminController::class, 'saveDepartment']);
            Route::put('/departments/{departmentId}', [AdminController::class, 'saveDepartment']);
            Route::delete('/departments/{departmentId}', [AdminController::class, 'deleteDepartment']);

            Route::post('/ranks', [AdminController::class, 'saveRank']);
            Route::put('/ranks/{rankId}', [AdminController::class, 'saveRank']);
            Route::delete('/ranks/{rankId}', [AdminController::class, 'deleteRank']);

            Route::get('/requests/{staffId}', [AdminController::class, 'requestHistory']);
            Route::post('/requests/approve-all', [AdminController::class, 'approveAllRequests']);
            Route::get('/review/{logId}', [AdminController::class, 'requestDetail']);
            Route::post('/review/{logId}', [AdminController::class, 'decideRequest']);
        });
});
