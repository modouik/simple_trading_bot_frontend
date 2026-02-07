import {
  RiHomeLine,
  RiLineChartLine,
  RiBarChartLine,
  RiTableLine,
  RiStockLine,
  RiPulseLine,
  RiRadarLine,
  RiWalletLine,
} from "react-icons/ri";

const MENUITEMS = [
  {
    title: "Dashboard",
    displayTitle: "Dashboard",
    icon: <RiHomeLine />,
    path: "/dashboard",
    type: "link"
  },
  {
    title: "Trading",
    displayTitle: "Trading",
    icon: <RiLineChartLine />,
    type: "sub",
    children: [
      {
        title: "Executive Overview",
        displayTitle: "Executive Overview",
        icon: <RiBarChartLine />,
        path: "/trading/overview",
        type: "link",
      },
      {
        title: "Sessions",
        displayTitle: "Sessions",
        icon: <RiTableLine />,
        path: "/trading/sessions",
        type: "link",
      },
      {
        title: "Trades",
        displayTitle: "Trades",
        icon: <RiStockLine />,
        path: "/trading/trades",
        type: "link",
      },
      {
        title: "Comparison",
        displayTitle: "Comparison",
        icon: <RiBarChartLine />,
        path: "/trading/comparison",
        type: "link",
      },
      {
        title: "Live Monitoring",
        displayTitle: "Live Monitoring",
        icon: <RiPulseLine />,
        path: "/trading/live",
        type: "link",
      },
      {
        title: "Scanner",
        displayTitle: "Scanner",
        icon: <RiRadarLine />,
        path: "/trading/scanner",
        type: "link",
      },
      {
        title: "Wallet",
        displayTitle: "Wallet",
        icon: <RiWalletLine />,
        path: "/trading/balance",
        type: "link",
      },
    ],
  },
];

export default MENUITEMS;
