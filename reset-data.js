// Reset all TrainLog user data
console.log('Resetting all TrainLog user data...');

// Clear all training log data
localStorage.removeItem('trainlog_workouts');
localStorage.removeItem('trainlog_templates');
localStorage.removeItem('trainlog_personalBests');
localStorage.removeItem('trainlog_supplements');
localStorage.removeItem('trainlog_supplementLogs');

// Clear other app data
localStorage.removeItem('congratsDismissedDate');
localStorage.removeItem('lastWorkoutDate');

console.log('All user data has been reset.');
console.log('Reloading page...');

// Reload the page to reflect changes
window.location.reload();