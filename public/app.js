// State management
let currentWorkoutId = null;
let currentExercises = [];

// DOM Elements
const startWorkoutBtn = document.getElementById('start-workout');
const workoutExercises = document.getElementById('workout-exercises');
const exerciseList = document.getElementById('exercise-list');
const addExerciseBtn = document.getElementById('add-exercise');
const finishWorkoutBtn = document.getElementById('finish-workout');
const exerciseForm = document.getElementById('exercise-form');
const exerciseEntry = document.getElementById('exercise-entry');
const cancelExerciseBtn = document.getElementById('cancel-exercise');
const exerciseSearch = document.getElementById('exercise-search');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Event Listeners
startWorkoutBtn.addEventListener('click', startNewWorkout);
addExerciseBtn.addEventListener('click', showExerciseForm);
finishWorkoutBtn.addEventListener('click', finishWorkout);
exerciseEntry.addEventListener('submit', handleExerciseSubmit);
cancelExerciseBtn.addEventListener('click', hideExerciseForm);
exerciseSearch.addEventListener('input', debounce(searchExercises, 300));
tabButtons.forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
});

// Initialize
loadWorkoutHistory();
loadExerciseHistory();

// Functions
async function startNewWorkout() {
    try {
        const response = await fetch('/api/workout', {
            method: 'POST'
        });
        const workoutId = await response.json();
        currentWorkoutId = workoutId;
        startWorkoutBtn.classList.add('hidden');
        workoutExercises.classList.remove('hidden');
        currentExercises = [];
        updateExerciseList();
    } catch (error) {
        console.error('Error starting workout:', error);
        alert('Failed to start workout');
    }
}

function showExerciseForm() {
    exerciseForm.classList.remove('hidden');
    exerciseEntry.reset();
}

function hideExerciseForm() {
    exerciseForm.classList.add('hidden');
}

async function handleExerciseSubmit(event) {
    event.preventDefault();
    
    const exerciseData = {
        WorkoutID: currentWorkoutId,
        ExerciseName: document.getElementById('exercise-name').value,
        Weight: Number(document.getElementById('weight').value),
        Sets: Number(document.getElementById('sets').value),
        Reps: document.getElementById('reps').value ? Number(document.getElementById('reps').value) : null,
        Time: document.getElementById('time').value ? Number(document.getElementById('time').value) : null
    };

    try {
        const response = await fetch('/api/exercise', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(exerciseData)
        });
        
        if (!response.ok) throw new Error('Failed to save exercise');
        
        const result = await response.json();
        currentExercises.push({ ...exerciseData, EntryId: result });
        updateExerciseList();
        hideExerciseForm();
    } catch (error) {
        console.error('Error saving exercise:', error);
        alert('Failed to save exercise');
    }
}

function updateExerciseList() {
    exerciseList.innerHTML = currentExercises.map(exercise => `
        <div class="exercise-item">
            <h4>${exercise.ExerciseName}</h4>
            <p>Weight: ${exercise.Weight} lbs</p>
            <p>Sets: ${exercise.Sets}</p>
            ${exercise.Reps ? `<p>Reps: ${exercise.Reps}</p>` : ''}
            ${exercise.Time ? `<p>Time: ${exercise.Time}s</p>` : ''}
        </div>
    `).join('');
}

async function finishWorkout() {
    if (!currentWorkoutId) return;
    
    try {
        await fetch(`/api/workout/${currentWorkoutId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                WorkoutID: currentWorkoutId,
                Timestamp: new Date().toISOString()
            })
        });
        
        currentWorkoutId = null;
        currentExercises = [];
        startWorkoutBtn.classList.remove('hidden');
        workoutExercises.classList.add('hidden');
        loadWorkoutHistory();
    } catch (error) {
        console.error('Error finishing workout:', error);
        alert('Failed to finish workout');
    }
}

async function loadWorkoutHistory() {
    try {
        const response = await fetch('/api/workout/history');
        const workouts = await response.json();
        
        console.log('Raw workout data:', workouts); // Debug raw data
        
        // Sort workouts by timestamp and take last 10
        const sortedWorkouts = workouts
            .sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp))
            .slice(0, 10);
        
        console.log('Sorted workouts:', sortedWorkouts); // Debug sorted data
        
        document.getElementById('workout-list').innerHTML = sortedWorkouts.map(workout => {
            console.log('Processing workout:', workout); // Debug individual workout
            // Extract WorkoutID directly from the database response
            const workoutId = workout.WorkoutID;
            
            if (!workoutId) {
                console.error('Missing WorkoutID for workout:', workout);
                return ''; // Skip this workout if no ID
            }
            
            const workoutDate = workout.Timestamp ? new Date(workout.Timestamp).toLocaleString() : 'In Progress';
            console.log('Using workout ID:', workoutId); // Debug workout ID
            
            return `
                <div class="exercise-item workout-entry" data-workout-id="${workoutId}">
                    <div class="workout-header">
                        <div>
                            <h4>Workout</h4>
                            <p>Date: ${workoutDate}</p>
                        </div>
                        <button class="secondary-button view-exercises-btn">View Exercises</button>
                    </div>
                    <div class="workout-exercises hidden"></div>
                </div>
            `;
        }).join('');

        // Add click handlers for the view exercises buttons
        document.querySelectorAll('.view-exercises-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const workoutEntry = button.closest('.workout-entry');
                const workoutId = workoutEntry.dataset.workoutId;
                console.log('Clicked workout entry:', workoutEntry); // Debug clicked element
                console.log('Clicked workout ID:', workoutId); // Debug clicked ID
                
                if (!workoutId) {
                    console.error('No workout ID found');
                    return;
                }

                const exercisesDiv = workoutEntry.querySelector('.workout-exercises');
                const isHidden = exercisesDiv.classList.contains('hidden');

                if (isHidden) {
                    // Only fetch if we're showing the exercises
                    button.textContent = 'Loading...';
                    console.log('Fetching exercises for workout:', workoutId); // Debug fetch
                    await loadWorkoutExercises(workoutId, exercisesDiv);
                    button.textContent = 'Hide Exercises';
                } else {
                    button.textContent = 'View Exercises';
                }
                exercisesDiv.classList.toggle('hidden');
            });
        });
    } catch (error) {
        console.error('Error loading workout history:', error);
        document.getElementById('workout-list').innerHTML = '<p class="error">Failed to load workout history</p>';
    }
}

async function loadWorkoutExercises(workoutId, container) {
    try {
        console.log('Making request for workout exercises:', workoutId); // Debug request
        // Add loading state
        container.innerHTML = '<p class="loading">Loading exercises...</p>';
        
        const response = await fetch(`/api/exercise/workout/${workoutId}`);
        console.log('Exercise response:', response); // Debug response
        
        if (!response.ok) {
            throw new Error('Failed to fetch exercises');
        }
        
        const exercises = await response.json();
        console.log('Received exercises:', exercises); // Debug exercises data
        
        if (!exercises || exercises.length === 0) {
            container.innerHTML = '<p class="no-exercises">No exercises found for this workout</p>';
            return;
        }
        
        container.innerHTML = exercises.map(exercise => `
            <div class="exercise-item nested">
                <h4>${exercise.ExerciseName}</h4>
                <p>Weight: ${exercise.Weight} lbs</p>
                <p>Sets: ${exercise.Sets}</p>
                ${exercise.Reps ? `<p>Reps: ${exercise.Reps}</p>` : ''}
                ${exercise.Time ? `<p>Time: ${exercise.Time}s</p>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading workout exercises:', error);
        container.innerHTML = '<p class="error">Failed to load exercises</p>';
    }
}

async function searchExercises() {
    const searchTerm = exerciseSearch.value.trim();
    const exerciseHistoryList = document.getElementById('exercise-history-list');
    
    // Clear previous results
    exerciseHistoryList.innerHTML = '<p>Enter an exercise name to search</p>';
    
    if (!searchTerm) {
        return;
    }
    
    try {
        exerciseHistoryList.innerHTML = '<p>Searching...</p>';
        console.log('Original search term:', searchTerm);
        
        // Properly encode the search term for URLs
        const encodedSearchTerm = encodeURIComponent(searchTerm);
        const url = `/api/exercise/history/${encodedSearchTerm}`;
        console.log('Making request to:', url);
        
        const response = await fetch(url);
        console.log('Search response:', response);
        
        if (!response.ok) {
            throw new Error(`Failed to search exercises: ${response.status} ${response.statusText}`);
        }
        
        const exercises = await response.json();
        console.log('Found exercises:', exercises);
        
        if (!exercises || exercises.length === 0) {
            exerciseHistoryList.innerHTML = '<p>No exercises found</p>';
            return;
        }
        
        // Sort exercises by timestamp (most recent first)
        const sortedExercises = exercises.sort((a, b) => 
            new Date(b.Timestamp || 0) - new Date(a.Timestamp || 0)
        );
        
        exerciseHistoryList.innerHTML = sortedExercises.map(exercise => `
            <div class="exercise-item">
                <h4>${exercise.ExerciseName}</h4>
                <p>Weight: ${exercise.Weight} lbs</p>
                <p>Sets: ${exercise.Sets}</p>
                ${exercise.Reps ? `<p>Reps: ${exercise.Reps}</p>` : ''}
                ${exercise.Time ? `<p>Time: ${exercise.Time}s</p>` : ''}
                <p>Date: ${exercise.Timestamp ? new Date(exercise.Timestamp).toLocaleString() : 'No date'}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error searching exercises:', error);
        exerciseHistoryList.innerHTML = `<p class="error">Failed to search exercises: ${error.message}</p>`;
    }
}

function switchTab(tabName) {
    tabButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.tab === tabName);
    });
    
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-history`);
    });
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 