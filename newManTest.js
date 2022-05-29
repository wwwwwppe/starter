const newman = require('newman');

newman.run({
    collection: require('./dev-data/data/tours-simple.json'),
    reporters: 'cli'
},(err) => {
    if (err){
        throw err;
    }
    console.log('collection run complete');
});