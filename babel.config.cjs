module.exports = {
    presets: [
        // [
        //     './babel-register.cjs',
        //     {
        //         targets: {
        //             node: 'current'
        //         }
        //     }
        // ],
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current',
                },
            },
        ],
        [
            '@babel/preset-typescript',
            {
                targets: {
                    node: 'current'
                }
            }
        ]
    ]
};
