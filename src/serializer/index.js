const { set } = require('lodash');

module.exports = (data, serializer) => Object.entries(serializer)
    .reduce((model, [origin, target]) => {
        set(model, target, data[origin]);
        return model;
    }, {});
