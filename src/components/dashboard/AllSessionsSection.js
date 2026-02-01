import { useQuery } from "@tanstack/react-query";
import DashboardWrapper from "./DashboardWrapper";
import request from "../../utils/axiosUtils";
import { SessionsAPI } from "../../utils/axiosUtils/API";
import { Table } from "reactstrap";
import I18NextContext from "@/helper/i18NextContext";
import { useContext } from "react";
import { useTranslation } from "@/app/i18n/client";
import { getSessionStatusClass } from "../trading-dashboard/utils";

const AllSessionsSection = () => {
  const { i18Lang } = useContext(I18NextContext);
  const { t } = useTranslation(i18Lang, "common");
  const { data, isLoading } = useQuery({
    queryKey: [SessionsAPI],
    queryFn: () => request({ url: SessionsAPI, params: { per_page: 8 } }),
    refetchOnWindowFocus: false,
    select: (res) => {
      const payload = res?.data;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload)) return payload;
      return payload?.data ?? [];
    },
  });

  return (
    <DashboardWrapper classes={{ title: "AllSessions", colProps: { sm: 12 } }}>
      <div className="table-responsive">
        <Table>
          <thead>
            <tr>
              <th>{t("SessionId")}</th>
              <th>{t("Strategy")}</th>
              <th>{t("Symbol")}</th>
              <th>{t("ReturnPct")}</th>
              <th>{t("PnL")}</th>
              <th>{t("Status")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>{t("Loading")}...</td>
              </tr>
            ) : (
              data?.map((session) => (
                <tr key={session.id}>
                  <td>{session.id}</td>
                  <td>{session.strategy_name}</td>
                  <td>{session.symbol}</td>
                  <td>{session.return_pct ?? "--"}</td>
                  <td>{session.pnl ?? "--"}</td>
                  <td>
                    <div className={getSessionStatusClass(session.status)}>
                      <span>{session.status ?? "unknown"}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </DashboardWrapper>
  );
};

export default AllSessionsSection;
