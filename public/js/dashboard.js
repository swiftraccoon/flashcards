document.addEventListener('DOMContentLoaded', function () {
    const correctnessCtx = document.getElementById('correctnessChart').getContext('2d');
    const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');

    fetch('/api/analytics')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Analytics data fetched successfully.');

            if (data && data.analytics && data.analytics.length > 0) {
                const labels = data.analytics.map(analytic => new Date(analytic.interactionTimestamp).toLocaleDateString());
                const correctnessData = data.analytics.map(analytic => analytic.performanceMetrics.correctness ? 1 : 0);
                const responseTimeData = data.analytics.map(analytic => analytic.performanceMetrics.responseTime / 1000); // Convert milliseconds to seconds

                const correctnessChart = new Chart(correctnessCtx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Correctness',
                            data: correctnessData,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function (value) {
                                        return value === 1 ? 'Correct' : 'Incorrect';
                                    }
                                }
                            }
                        }
                    }
                });

                const responseTimeChart = new Chart(responseTimeCtx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Response Time (s)',
                            data: responseTimeData,
                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            } else {
                console.log('No analytics data available to display.');
            }
        })
        .catch(error => {
            console.error('Error fetching analytics data:', error.message, error.stack);
        });
});