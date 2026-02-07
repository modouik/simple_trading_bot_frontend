"use client";

import PageHeader from "../common/PageHeader";
import BalanceChart from "../charts/BalanceChart";

const WalletPage = () => (
  <div className="container-fluid">
    <PageHeader
      title="Wallet history"
      subtitle="Evolution of your Spot Wallet total value (USD) over time. Synced when you connect your exchange in the app."
    />
    <div className="row">
      <div className="col-12">
        <BalanceChart />
      </div>
    </div>
  </div>
);

export default WalletPage;
