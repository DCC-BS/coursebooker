<script setup>
const emit = defineEmits(["userCreated", "cancel"]);
const { showToast } = useUserFeedback();

const isCreating = ref(false);
const formData = reactive({
    email: "",
    isAdmin: false,
});

const emailError = ref("");

const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
        emailError.value = "Email is required";
        return false;
    }
    if (!emailRegex.test(formData.email)) {
        emailError.value = "Please enter a valid email address";
        return false;
    }
    emailError.value = "";
    return true;
};

const handleSubmit = async () => {
    if (!validateEmail()) {
        return;
    }

    isCreating.value = true;
    try {
        await createUser({
            email: formData.email,
            isAdmin: formData.isAdmin,
        });

        showToast(`User created successfully ${formData.email} has been added ${formData.isAdmin ? "as an admin" : "as a regular user"}`, "success");

        // Reset form
        formData.email = "";
        formData.isAdmin = false;

        emit("userCreated");
    } catch (error) {
        console.error("Failed to create user:", error);
        if (error.message?.includes("already exists")) {
            showToast("User already exists: A user with this email address already exists", "error");
        } else {
            showToast("Failed to create user. Please try again.", "error");
        }
    } finally {
        isCreating.value = false;
    }
};

const handleCancel = () => {
    formData.email = "";
    formData.isAdmin = false;
    emailError.value = "";
    emit("cancel");
};
</script>

<template>
    <div class="bg-white rounded-lg shadow-lg">
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">Add New User</h3>
                <UButton color="neutral" variant="ghost" icon="i-lucide-x" size="sm" @click="handleCancel" />
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Email Field -->
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <UInput id="email" v-model="formData.email" type="email" placeholder="user@example.com"
                        :invalid="!!emailError" @blur="validateEmail" @input="emailError = ''" class="w-full" />
                    <p v-if="emailError" class="text-sm text-red-600 mt-1">
                        {{ emailError }}
                    </p>
                </div>

                <!-- Admin Toggle -->
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <label for="isAdmin" class="block text-sm font-medium text-gray-700">
                            Administrator Rights
                        </label>
                        <p class="text-xs text-gray-500">
                            Grant admin privileges to this user
                        </p>
                    </div>
                    <UToggle id="isAdmin" v-model="formData.isAdmin" />
                </div>

                <!-- Preview -->
                <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 class="text-sm font-medium text-blue-900 mb-2">User Preview</h4>
                    <div class="space-y-1 text-xs">
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-mail" class="h-3 w-3 text-blue-600" />
                            <span class="text-blue-800">{{ formData.email || 'user@example.com' }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-shield" class="h-3 w-3 text-blue-600" />
                            <span class="text-blue-800">{{ formData.isAdmin ? 'Administrator' : 'Regular User' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end space-x-3 pt-4">
                    <UButton type="button" color="neutral" variant="ghost" @click="handleCancel" :disabled="isCreating">
                        Cancel
                    </UButton>
                    <UButton type="submit" color="primary" :loading="isCreating"
                        :disabled="!formData.email || !!emailError">
                        {{ isCreating ? 'Creating...' : 'Create User' }}
                    </UButton>
                </div>
            </form>
        </div>
    </div>
</template>
