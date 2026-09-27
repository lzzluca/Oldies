  <script>
  (function() {
    "use strict";

    // TODO move those in a proper module, for constants only!
    const TODAY = new Date()
    const CURRENT_MONTH = TODAY.getMonth();
    const CURRENT_YEAR = TODAY.getYear();



    /*export let filters = {
            thisMonth: (transaction) => (
              transaction.date.getMonth() === CURRENT_MONTH &&
              transaction.date.getYear()  === CURRENT_YEAR
            ),
            lastTransactions: (transaction) => (
              // TODO the year must be involved somehow here...
              transaction.date.getMonth() < CURRENT_MONTH
            )
          }*/
    export () => {};


    Polymer(TransactionsPageUtils);
  })();
  </script>
