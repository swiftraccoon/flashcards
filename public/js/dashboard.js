document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('learningProgressChart').getContext('2d');
    fetch('/api/analytics')
        .then(response => response.json())
        .then(data => {
            const labels = data.analytics.map(analytic => new Date(analytic.interactionTimestamp).toLocaleDateString());
            const dataPoints = data.analytics.map(analytic => analytic.performanceMetrics.correctness ? 1 : 0);
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Learning Progress',
                        data: dataPoints,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value, index, ticks) {
                                    return value === 1 ? 'Correct' : 'Incorrect';
                                }
                            }
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error fetching analytics data:', error.message, error.stack);
        });
});