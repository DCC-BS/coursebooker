<script setup lang="ts">
import { motion, AnimatePresence } from "motion-v";

const { courses, isPending, error } = useCourses();

// Search and filter state
const searchQuery = ref('');
const selectedDate = ref('');
const selectedDay = ref('');
const selectedTimeRange = ref('');

// Filter options
const daysOfWeek = [
    { value: '', label: 'All Days' },
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' }
];

const timeRanges = [
    { value: '', label: 'All Times' },
    { value: 'morning', label: 'Morning (6:00 - 12:00)' },
    { value: 'afternoon', label: 'Afternoon (12:00 - 18:00)' },
    { value: 'evening', label: 'Evening (18:00 - 24:00)' }
];

// Helper function to check if a lesson is in a specific time range
function isLessonInTimeRange(lesson: { start: Date }, timeRange: string): boolean {
    if (!timeRange) return true;

    const hour = lesson.start.getHours();

    switch (timeRange) {
        case 'morning':
            return hour >= 6 && hour < 12;
        case 'afternoon':
            return hour >= 12 && hour < 18;
        case 'evening':
            return hour >= 18 && hour <= 23;
        default:
            return true;
    }
}

// Helper function to check if a lesson is on a specific day of week
function isLessonOnDay(lesson: { start: Date }, day: string): boolean {
    if (!day) return true;
    return lesson.start.getDay().toString() === day;
}

// Helper function to check if a lesson is on a specific date
function isLessonOnDate(lesson: { start: Date }, date: string): boolean {
    if (!date) return true;
    const lessonDate = lesson.start.toISOString().split('T')[0];
    return lessonDate === date;
}

// Computed property for filtered courses
const filteredCourses = computed(() => {
    if (!courses.value) return [];

    return courses.value.filter(course => {
        // Search filter (title and description)
        const matchesSearch = !searchQuery.value ||
            course.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.value.toLowerCase());

        if (!matchesSearch) return false;

        // Check if course has sessions that match the filters
        const hasMatchingSessions = course.sessions.some(session => {
            return session.lessons.some(lesson => {
                const matchesDate = isLessonOnDate(lesson, selectedDate.value);
                const matchesDay = isLessonOnDay(lesson, selectedDay.value);
                const matchesTime = isLessonInTimeRange(lesson, selectedTimeRange.value);

                return matchesDate && matchesDay && matchesTime;
            });
        });

        // If no filters are applied, show all courses
        const noFiltersApplied = !selectedDate.value && !selectedDay.value && !selectedTimeRange.value;

        return noFiltersApplied || hasMatchingSessions;
    });
});

// Clear all filters
function clearFilters() {
    searchQuery.value = '';
    selectedDate.value = '';
    selectedDay.value = '';
    selectedTimeRange.value = '';
}
</script>

<template>
    <div class="bg-gradient-to-br from-blue-50 to-indigo-100">
        <!-- Header -->
        <motion.div :initial="{ opacity: 0, y: -50 }" :animate="{ opacity: 1, y: 0 }" class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 class="text-4xl font-bold text-gray-900 text-center mb-2">
                    Welcome to CourseBooker
                </h1>
                <p class="text-lg text-gray-600 text-center">
                    Discover and book amazing courses
                </p>
            </div>
        </motion.div>

        <!-- Search and Filters -->
        <motion.div :initial="{ opacity: 0, y: 30 }" :animate="{ opacity: 1, y: 0 }" :transition="{ delay: 0.2 }"
            class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 class="text-2xl font-semibold text-gray-900 mb-6">Search & Filter</h2>

                <!-- Search Box -->
                <div class="mb-6">
                    <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
                        Search Courses
                    </label>
                    <div class="relative">
                        <UIcon name="i-lucide-search"
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input id="search" v-model="searchQuery" type="text"
                            placeholder="Search by title or description..."
                            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
                    </div>
                </div>

                <!-- Filters Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <!-- Date Filter -->
                    <div>
                        <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Date
                        </label>
                        <input id="date" v-model="selectedDate" type="date"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
                    </div>

                    <!-- Day of Week Filter -->
                    <div>
                        <label for="day" class="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Day
                        </label>
                        <select id="day" v-model="selectedDay"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                            <option v-for="day in daysOfWeek" :key="day.value" :value="day.value">
                                {{ day.label }}
                            </option>
                        </select>
                    </div>

                    <!-- Time Range Filter -->
                    <div>
                        <label for="time" class="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Time
                        </label>
                        <select id="time" v-model="selectedTimeRange"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                            <option v-for="time in timeRanges" :key="time.value" :value="time.value">
                                {{ time.label }}
                            </option>
                        </select>
                    </div>
                </div>

                <!-- Clear Filters Button -->
                <div class="flex justify-end">
                    <UButton @click="clearFilters" variant="outline" size="sm" class="flex items-center gap-2">
                        <UIcon name="i-lucide-x" class="w-4 h-4" />
                        Clear Filters
                    </UButton>
                </div>

                <!-- Active Filters Display -->
                <div v-if="searchQuery || selectedDate || selectedDay || selectedTimeRange"
                    class="mt-4 pt-4 border-t border-gray-200">
                    <p class="text-sm text-gray-600 mb-2">Active filters:</p>
                    <div class="flex flex-wrap gap-2">
                        <span v-if="searchQuery"
                            class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Search: "{{ searchQuery }}"
                        </span>
                        <span v-if="selectedDate"
                            class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Date: {{ selectedDate }}
                        </span>
                        <span v-if="selectedDay"
                            class="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                            Day: {{daysOfWeek.find(d => d.value === selectedDay)?.label}}
                        </span>
                        <span v-if="selectedTimeRange"
                            class="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            Time: {{timeRanges.find(t => t.value === selectedTimeRange)?.label}}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>

        <!-- Loading State -->
        <motion.div v-if="isPending" :initial="{ opacity: 0 }" :animate="{ opacity: 1 }"
            class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <LoadingView :text="'Loading courses...'" />
        </motion.div>

        <!-- Error State -->
        <div v-else-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <UIcon name="i-lucide-alert-circle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p class="text-red-800">{{ error }}</p>
            </div>
        </div>

        <!-- Results Count -->
        <motion.div v-else-if="filteredCourses.length >= 0" :initial="{ opacity: 0 }" :animate="{ opacity: 1 }"
            :transition="{ delay: 0.4 }" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
            <p class="text-gray-600">
                {{ filteredCourses.length === 0 ? 'No courses found' : `Found ${filteredCourses.length}
                course${filteredCourses.length === 1 ? '' : 's'}` }}
            </p>
        </motion.div>

        <!-- Courses Grid -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    <motion.div v-for="(course, index) in filteredCourses" :key="course.id"
                        :initial="{ opacity: 0, y: 50 }" :animate="{
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.5, delay: 0.1 * index, type: 'spring', stiffness: 100 }
                        }" :hover="{
                            y: -8,
                            scale: 1.02,
                            transition: { duration: 0.2 }
                        }" :exit="{ opacity: 0, y: 50 }"
                        class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                        <!-- Course Header -->
                        <div class="p-6 border-b border-gray-100">
                            <h3 class="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                {{ course.title }}
                            </h3>
                            <p class="text-gray-600 text-sm leading-relaxed">
                                {{ course.description.length > 120 ? course.description.slice(0, 120) + '...' :
                                    course.description }}
                            </p>
                        </div>

                        <!-- Sessions -->
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h4 class="font-semibold text-gray-900">Sessions</h4>
                                <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                    {{ course.sessions.length }} session{{ course.sessions.length === 1 ? '' : 's' }}
                                </span>
                            </div>

                            <div class="space-y-3 max-h-48 overflow-y-auto">
                                <div v-for="session in course.sessions" :key="session.id"
                                    class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div class="grid grid-cols-1 gap-2 text-sm">
                                        <div class="flex items-center gap-2">
                                            <UIcon name="i-lucide-clock" class="w-4 h-4 text-gray-500" />
                                            <span class="font-medium">{{ getSessionDuration(session) }}</span>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-gray-500" />
                                            <span>{{ session.location }}</span>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <UIcon name="i-lucide-calendar" class="w-4 h-4 text-gray-500" />
                                            <span>{{ getSessionDate(session) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Button -->
                        <div class="p-6 pt-0">
                            <UButton :to="`/courses/${course.id}`" variant="solid" class="w-full" size="lg">
                                <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2" />
                                View Course Details
                            </UButton>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <!-- Empty State -->
            <motion.div v-if="filteredCourses.length === 0" :initial="{ opacity: 0, scale: 0.9 }"
                :animate="{ opacity: 1, scale: 1 }" class="text-center py-16">
                <UIcon name="i-lucide-search-x" class="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h3 class="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
                <p class="text-gray-600 mb-6">
                    Try adjusting your search criteria or clearing your filters.
                </p>
                <UButton @click="clearFilters" variant="outline">
                    <UIcon name="i-lucide-refresh-cw" class="w-4 h-4 mr-2" />
                    Clear All Filters
                </UButton>
            </motion.div>
        </div>
    </div>
</template>