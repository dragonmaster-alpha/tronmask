<template>
  <div>
    <app-header @refresh="refreshExchange" />

    <main class="main">
      <div class="box highlight">
        <div class="box-label">Account Balance</div>
        <div class="box-balance">
          {{ $formatNumber(account.balance, { maximumSignificantDigits: 7 }) }}
        </div>
        <div class="box-balance-code">TRX</div>
        <div class="box-address-label">Address</div>
        <div class="box-address">{{ address }}</div>
      </div>
      <div>
        <label class="input-label">Amount</label>
        <input
          class="input-field"
          type="number"
          placeholder="Amount!"
          v-model="input_value"
          v-on:change="exchange"
          @keydown="filterKey"
          @input="filterInput"
        />
      </div>
      <div>
        <label class="input-label">Currency</label>
        <select class="input-field" v-model="to" v-on:change="exchange">
          <option :value="item.symbol" v-for="item in test" :key="item.name">
            {{ item.name }}
          </option>
        </select>
      </div>
      <p v-if="errored" style="color: red">{{ result }}</p>
      <p v-else>{{ result }}</p>
      <div class="box-buttons">
        <router-link class="red" to="/final_exchange"
          ><span>Exchange</span></router-link
        >
      </div>
    </main>
  </div>
</template>
<script>
import { mapState } from "vuex";
import axios from "axios";
import { CONTRACT_TYPES, getTronScanLink } from "../../lib/utils";
import API from "../../lib/api";
import account from "../mixins/account";
import AppHeader from "../components/AppHeader.vue";
import ExternalLink from "../components/ExternalLink.vue";

export default {
  mixins: [account],
  components: {
    AppHeader,
    ExternalLink,
  },

  data: () => {
    return {
      test: [],
      from: "",
      to: [],
      result: "",
      input_value: "",
      errored: false,
    };
  },

  computed: mapState({
    address: (state) => state.wallet.address,
    keystore: (state) => state.wallet.keystore,
    transactions: (state) => state.account.transactions,
    transMoney: (state) => state.wallet.transMoney,
    transCurrency: (state) => state.wallet.transCurrency,
    transExchangeMoney: (state) => state.wallet.transExchangeMoney,
    // transMoney: {
    //   get() {
    //     return this.$store.state.transMoney;
    //   },
    //   set(value) {
    //     this.$store.commit("transMoney", value);
    //   },
    // },
    // transCurrency: {
    //   get() {
    //     return this.$store.state.transCurrency;
    //   },
    //   set(value) {
    //     this.$store.commit("transCurrency", value);
    //   },
    // },
    
    // transExchangeMoney: {
    //   get() {
    //     return this.$store.state.transExchangeMoney;
    //   },
    //   set(value) {
    //     this.$store.commit("transExchangeMoney", value);
    //   },
    // },
  }),

  mounted() {
    this.load();
    this.loadAccount();
  },

  methods: {
    async load() {
      axios
        .get(
          "https://api.simpleswap.io/v1/get_all_currencies?api_key=707c5c24-7ee8-48c5-952c-4d268f30a3a1"
        )
        .then((response) => {
          console.log(response.data);
          this.test = response.data;
          // var data = JSON.parse(response.data);
          //   this.info = response.data.bpi;
        })
        .catch((error) => {
          console.log(error);
          this.errored = true;
        })
        .finally(() => (this.loading = false));
    },

    async exchange() {
      if (this.to == "" || this.input_value == "") return;
      // this.transMoney = this.input_value;
      // this.transCurrency = this.to;
      this.$store.commit("wallet/transMoney", this.input_value);
      this.$store.commit("wallet/transCurrency", this.to.toUpperCase());
      // this.transMoney.set();
      axios
        .get(
          "https://api.simpleswap.io/v1/get_estimated?api_key=707c5c24-7ee8-48c5-952c-4d268f30a3a1&fixed=&currency_from=TRX&currency_to=" +
            this.to +
            "&amount=" +
            this.input_value
        )
        .then((response) => {
          this.errored = false;
          console.log(response);
          this.result = response.data != null ? response.data : response;
          this.$store.commit(
            "wallet/transExchangeMoney",
            this.result
          );
          // var data = JSON.parse(response.data);
          //   this.info = response.data.bpi;
        })
        .catch((error) => {
          this.errored = true;
          axios
            .get(
              "https://api.simpleswap.io/v1/get_ranges?api_key=707c5c24-7ee8-48c5-952c-4d268f30a3a1&fixed=&currency_from=TRX&currency_to=" +
                this.to
            )
            .then((response) => {
              console.log(response);
              //   this.result = response.data != null ? response.data : response;
              var res = "";
              if (response.data.min != null) {
                res += "Min amount " + response.data.min + " " + "TRX" + "  ";
              }
              if (response.data.max != null) {
                res += "Max amount " + response.data.max + " " + this.to;
              }
              this.result = res;
              // var data = JSON.parse(response.data);
              //   this.info = response.data.bpi;
            })
            .catch((error) => {
              this.result = "-";
              console.log(error);
              this.errored = true;
            })
            .finally(() => (this.loading = false));
        })
        .finally(() => (this.loading = false));
    },
    filterKey(e) {
      const key = e.key;

      // If is '.' key, stop it
      //   if (key === ".") return e.preventDefault();

      // OPTIONAL
      // If is 'e' key, stop it
      if (key === "e") return e.preventDefault();
    },

    filterInput(e) {
      e.target.value = e.target.value.replace(/[^0-9]+/g, "");
    },

    refreshExchange() {
      this.$store.commit("loading", true);
      this.load();
    },
  },
};
</script>
<style>
.transaction {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.5s ease;
  background: #ffffff;
  border-radius: 5px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #424242;
}
.transaction:hover,
.transaction:focus {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}
.transaction:active {
  transform: translateY(1px);
}
.transaction span {
  display: block;
}
.transaction-content {
  width: 90%;
}
.transaction-contract {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}
.transaction-date {
  font-size: 0.625rem;
  color: #9e9e9e;
}
.transaction-icon {
  width: 10%;
  font-size: 1rem;
  color: #757575;
  text-align: right;
}
.transaction:hover .transaction-icon,
.transaction:focus .transaction-icon {
  color: #d32f2f;
}
</style>

