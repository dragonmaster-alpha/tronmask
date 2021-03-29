export default {
    namespaced: true,

    state: {
        address: false,
        keypass: false,
        keystore: false,
        transMoney:"",
        transExchangeMoney:"",
        transCurrency:"",
    },

    mutations: {
        address(state, address) {
            state.address = address
        },

        keypass(state, keypass) {
            state.keypass = keypass
        },

        keystore(state, keystore) {
            state.keystore = keystore
        },

        transMoney(state, transMoney) {
            state.transMoney = transMoney
        },

        transCurrency(state, transCurrency) {
            state.transCurrency = transCurrency
        },
        
        transExchangeMoney(state, transExchangeMoney) {
            state.transExchangeMoney = transExchangeMoney
        },
    }
}
