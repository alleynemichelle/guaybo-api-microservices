module.exports = (options) => {
    return {
        ...options,
        output: {
            ...options.output,
            libraryTarget: 'commonjs2',
        },
    };
};
