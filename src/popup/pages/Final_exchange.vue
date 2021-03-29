<template>
    <div>
        <app-header subtitle="Receipient info" />

        <main class="main">
            <form @submit.prevent="showConfirmDialog" action="" method="post" class="auth-form" autocomplete="off">
                <div v-show="message.show" class="message" :class="[ message.type ]">
                    {{ message.text }}
                </div>
                <div>
                    <label class="input-label">YOU SEND:</label>
                    <label class="input-label">{{this.transMoney}} TRX</label>
                        <br>
                    <label class="input-label">YOU GET:</label>
                    <label class="input-label">{{this.transExchangeMoney}} {{this.transCurrency}}</label>

                        <br>
                </div>        
                <label class="input-label">
                    Enter the recipient’s address
                    <input class="input-field" type="text" name="address" v-bind:placeholder="'Enter the recipient\'s '+ this.transCurrency + ' address'" v-model="receipient">
                </label>
                <button class="button brand" type="submit">Next</button>
            </form>
        </main>

        <confirm-dialog :text="confirmDialogText" ref="confirmDialog" @confirmed="sendPayment" />
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import { decryptKeyStore } from '../../lib/keystore'
    import { isAddressValid, pkToAddress } from '@tronscan/client/src/utils/crypto'
    import { getTokenRawAmount } from '../../lib/utils'
    import API from '../../lib/api'
    import account from '../mixins/account'
    import AppHeader from '../components/AppHeader.vue'
    import ConfirmDialog from '../components/ConfirmDialog.vue'
    import Exchange from './Exchange.vue'
    import WAValidator from '@swyftx/api-crypto-address-validator'

    export default {
        mixins: [account],

        components: {
            AppHeader,
            ConfirmDialog
        },

        data: () => ({
            amount: 0,
            receipient: '',
            selectedToken: false,
            message: {
                show: false,
                type: 'error',
                text: ''
            }
        }),

        computed: {
            confirmDialogText() {
                return `
                    Are you sure you want to send your deposit to
                    <div>to</div>
                    <div><strong>${this.receipient}</strong> ?</div>
                `
            },
            ...mapState({
                wallet: state => state.wallet,
                transMoney: state => state.wallet.transMoney,
                transCurrency: state => state.wallet.transCurrency,
                transExchangeMoney: state => state.wallet.transExchangeMoney,
            })
        },
        
        mounted() {
            console.log('mounted')
            this.setSelectedToken()
            if (this.account.tokens.length === 0) {
                this.loadTokens()
            }
        },

        methods: {
            setSelectedToken() {
                console.log('setselected token')
                if (this.account.tokens.length > 0) {
                    this.selectedToken = this.account.tokens[0]
                    console.log(this.selectedToken);
                }
            },

            async loadTokens() {
                console.log('load token', this.account)
                await this.loadAccount()
                this.setSelectedToken()
                this.$store.commit('loading', false)
            },
            async sendPayment() {
                console.log("1111111:  " + this.wallet.keypass);
                console.log("2222222:  " + this.wallet.keystore);
                const wallet = decryptKeyStore(this.wallet.keypass, this.wallet.keystore)
                console.log(this.account);
                if (!wallet) {
                    this.message.show = true
                    this.message.type = 'error'
                    this.message.text = 'Something went wrong while trying to send the payment'

                    return false
                }

                this.$store.commit('loading', true)
                let amount = this.transMoney;
                console.log('amount ', amount)
                console.log(this.wallet.address, this.receipient, amount);
                console.log(API(), API().getTokens());

                if (this.selectedToken.tokenName === "_") {
                    amount = getTokenRawAmount(this.transMoney)
                }else {
                    amount = getTokenRawAmount(this.transMoney, this.getTRC10Details(this.selectedToken.tokenName)[2])
                }
                
                console.log(this.selectedToken, this.wallet.address, pkToAddress(this.receipient), amount);

                try {
                    const result = await API().send(this.selectedToken, this.wallet.address, pkToAddress(this.receipient), amount)(wallet.privateKey)

                console.log(result);
                console.log('1');

                    this.$store.commit('loading', false)
                console.log('2');

                    this.message.show = true
                console.log('3');

                    if (result.success) {
                        this.message.type = 'success'
                        this.message.text = 'Payment has been successfully sent'
                    }else {
                        this.message.type = 'error'
                        this.message.text = result.message
                    }

                    this.receipient = ''
                    this.amount = 0
                } catch (e) {
                    this.$store.commit('loading', false)

                    this.message.show = true
                    this.message.type = 'error'
                    this.message.text = 'Something went wrong while trying to send the payment'
                }
            },

            showConfirmDialog(){
                this.message.show = false
                
                var isvalid = WAValidator.validate(this.receipient, this.transCurrency);
                // if (!isAddressValid(this.receipient)) {
                if (!isvalid) {
                    this.message.show = true
                    this.message.type = 'error'
                    this.message.text = 'Invalid recipient ' + this.transCurrency + ' address'

                    return false
                }

                this.$refs.confirmDialog.showDialog()
            },
        }
    }
</script>
