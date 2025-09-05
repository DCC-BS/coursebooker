<script setup lang="ts">
import type { User } from "~~/shared/models";

// Page meta
definePageMeta({
    layout: "admin",
    title: "Manage Users",
});

const feedback = useUserFeedback();

// Reactive data
const searchQuery = ref("");
const roleFilter = ref("all" as "all" | "admin" | "user");
const showCreateForm = ref(false);
const isCreatingUser = ref(false);
const newUserEmail = ref("");
const newUserIsAdmin = ref(false);

// Role filter options
const roleOptions = ref([
    { label: "All Users", value: "all" },
    { label: "Administrators", value: "admin" },
    { label: "Regular Users", value: "user" },
]);

// Fetch users
const { users, isPending, error, refresh } = useUsers();

// Computed filtered users
const filteredUsers = computed(() => {
    if (!users.value) return [];

    let filtered = users.value;

    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter((user) =>
            user.email.toLowerCase().includes(query),
        );
    }

    // Filter by role
    if (roleFilter.value !== "all") {
        filtered = filtered.filter((user) => {
            if (roleFilter.value === "admin") return user.isAdmin;
            if (roleFilter.value === "user") return !user.isAdmin;
            return true;
        });
    }

    return filtered;
});

// Stats
const totalUsers = computed(() => users.value?.length ?? 0);
const adminUsers = computed(
    () => users.value?.filter((user) => user.isAdmin).length ?? 0,
);
const regularUsers = computed(() => totalUsers.value - adminUsers.value);

// Handle creating a new user
const handleCreateUser = async () => {
    if (!newUserEmail.value) return;

    isCreatingUser.value = true;
    try {
        await createUser({
            email: newUserEmail.value,
            isAdmin: newUserIsAdmin.value,
        });

        feedback.showSuccess({
            title: "User created successfully",
        });

        // Reset form
        newUserEmail.value = "";
        newUserIsAdmin.value = false;
        showCreateForm.value = false;

        // Refresh users list
        await refresh();
    } catch (error: unknown) {
        console.error("Failed to create user:", error);
        let msg = "Unknown error";
        if (error && typeof error === "object") {
            const err = error as { statusMessage?: string; message?: string };
            msg = err.statusMessage ?? err.message ?? "Unknown error";
        }
        feedback.showError({
            title: `Failed to create user: ${msg}`,
        });
    } finally {
        isCreatingUser.value = false;
    }
};

// Handle updating user role
const handleUpdateUserRole = async (userEmail: string, isAdmin: boolean) => {
    try {
        await updateUser(userEmail, { isAdmin });
        feedback.showSuccess({
            title: `User ${isAdmin ? "promoted to" : "demoted from"} admin successfully`,
        });
        await refresh();
    } catch (error: unknown) {
        console.error("Failed to update user role:", error);

        let msg = "Unknown error";
        if (error && typeof error === "object") {
            const err = error as { statusMessage?: string; message?: string };
            msg = err.statusMessage ?? err.message ?? "Unknown error";
        }

        feedback.showError({
            title: `Failed to update user role: ${msg}`,
        });
    }
};

// Page head
useHead({
    title: "Manage Users - Admin Dashboard",
});
</script>

<template>
    <div class="space-y-6">
        <AdminHeader title="Manage Users" />

        <div class="px-2 pb-2">
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <UIcon name="i-lucide-users" class="h-8 w-8 text-primary-600" />
                        </div>
                        <div class="ml-4">
                            <div class="text-2xl font-bold text-gray-900">{{ totalUsers }}</div>
                            <div class="text-sm text-gray-500">Total Users</div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <UIcon name="i-lucide-shield" class="h-8 w-8 text-red-600" />
                        </div>
                        <div class="ml-4">
                            <div class="text-2xl font-bold text-gray-900">{{ adminUsers }}</div>
                            <div class="text-sm text-gray-500">Administrators</div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <UIcon name="i-lucide-user" class="h-8 w-8 text-green-600" />
                        </div>
                        <div class="ml-4">
                            <div class="text-2xl font-bold text-gray-900">{{ regularUsers }}</div>
                            <div class="text-sm text-gray-500">Regular Users</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Toolbar -->
            <div class="bg-white rounded-lg shadow p-4">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div class="flex flex-col sm:flex-row gap-4">
                        <UInput v-model="searchQuery" placeholder="Search users..." icon="i-lucide-search"
                            class="w-full sm:w-64" />

                        <USelect v-model="roleFilter" :items="roleOptions" class="w-full sm:w-48" />
                    </div>

                    <UButton color="primary" icon="i-lucide-user-plus" @click="showCreateForm = !showCreateForm">
                        {{ showCreateForm ? 'Cancel' : 'Add User' }}
                    </UButton>
                </div>
            </div>

            <!-- Create User Form -->
            <div v-if="showCreateForm" class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
                <form @submit.prevent="handleCreateUser" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <UInput id="email" v-model="newUserEmail" type="email" placeholder="user@example.com"
                                required />
                        </div>
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">
                                    Administrator Rights
                                </label>
                                <p class="text-xs text-gray-500">Grant admin privileges</p>
                            </div>
                            <USwitch v-model="newUserIsAdmin" />
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <UButton type="button" color="neutral" variant="ghost" @click="showCreateForm = false">
                            Cancel
                        </UButton>
                        <UButton type="submit" color="primary" :loading="isCreatingUser">
                            Create User
                        </UButton>
                    </div>
                </form>
            </div>

            <!-- Users List -->
            <div class="bg-white rounded-lg shadow">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">
                            All Users ({{ filteredUsers.length }})
                        </h3>
                    </div>

                    <!-- Loading State -->
                    <template v-if="isPending">
                        <div class="flex items-center justify-center py-12">
                            <div class="flex items-center space-x-2">
                                <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-primary-600" />
                                <span class="text-gray-500">Loading users...</span>
                            </div>
                        </div>
                    </template>

                    <!-- Error State -->
                    <template v-else-if="error">
                        <div class="text-center py-12">
                            <UIcon name="i-lucide-alert-circle" class="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
                            <p class="text-gray-500 mb-4">{{ error }}</p>
                            <UButton @click="refresh" color="primary">Try Again</UButton>
                        </div>
                    </template>

                    <!-- Empty State -->
                    <template v-else-if="!filteredUsers.length">
                        <div class="text-center py-12">
                            <UIcon name="i-lucide-users" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 class="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                            <p class="text-gray-500 mb-4">
                                {{ searchQuery || roleFilter !== 'all'
                                    ? 'Try adjusting your search or filters.'
                                    : 'Get started by adding your first user.' }}
                            </p>
                            <UButton v-if="!searchQuery && roleFilter === 'all'" @click="showCreateForm = true"
                                color="primary" icon="i-lucide-user-plus">
                                Add User
                            </UButton>
                        </div>
                    </template>

                    <!-- Users Grid -->
                    <template v-else>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div v-for="user in filteredUsers" :key="user.email"
                                class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <!-- User Header -->
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 mb-2">
                                            <UBadge :color="user.isAdmin ? 'primary' : 'secondary'" size="sm"
                                                :variant="user.isAdmin ? 'solid' : 'soft'">
                                                {{ user.isAdmin ? 'ADMIN' : 'USER' }}
                                            </UBadge>
                                        </div>
                                        <h4 class="text-lg font-semibold text-gray-900 mb-1 break-words">
                                            {{ user.email }}
                                        </h4>
                                    </div>
                                </div>

                                <!-- Registration Count -->
                                <div class="text-center py-4 border-t border-gray-200">
                                    <div class="text-2xl font-bold text-primary-600">
                                        {{ user.registrations?.length ?? 0 }}
                                    </div>
                                    <div class="text-xs text-gray-500">
                                        Session Registrations
                                    </div>
                                </div>

                                <!-- Registrations List -->
                                <div v-if="user.registrations && user.registrations.length > 0" class="mt-4">
                                    <h5 class="text-sm font-medium text-gray-700 mb-2">Registered Sessions:</h5>
                                    <div class="space-y-2 max-h-32 overflow-y-auto">
                                        <div v-for="registration in user.registrations" :key="registration.sessionId"
                                            class="p-2 bg-gray-50 rounded-md text-xs">
                                            <div class="font-medium text-gray-900">
                                                Session: {{ registration.sessionId.slice(0, 8) }}...
                                            </div>
                                            <div v-if="registration.session?.lessons && registration.session.lessons.length > 0"
                                                class="text-gray-600 mt-1">
                                                <div v-for="lesson in registration.session.lessons" :key="lesson.id">
                                                    📅 {{ new Date(lesson.start).toLocaleDateString() }}
                                                </div>
                                            </div>
                                            <div v-if="registration.session?.location" class="text-gray-600 mt-1">
                                                📍 {{ registration.session.location }}
                                            </div>
                                            <div v-if="registration.session?.teams_link" class="text-gray-600 mt-1">
                                                🔗 Teams Meeting Available
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Actions -->
                                <div class="mt-4 pt-4 border-t border-gray-200">
                                    <UButton size="xs" :color="user.isAdmin ? 'red' : 'primary'" variant="outline"
                                        @click="handleUpdateUserRole(user.email, !user.isAdmin)" class="w-full">
                                        {{ user.isAdmin ? 'Remove Admin' : 'Make Admin' }}
                                    </UButton>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>