import TopDashSection from "./TopDashSection"
import OpenSessionsSection from "./OpenSessionsSection"
import AllSessionsSection from "./AllSessionsSection"
import { Row, Col } from "reactstrap"

const MainDashboard = () => {
    return (
        <>
            <TopDashSection />
            <section className="app-theme-dashboard-sections">
                <Row className="g-3">
                    <Col lg={6} className="app-theme-dashboard-col">
                        <OpenSessionsSection />
                    </Col>
                    <Col lg={6} className="app-theme-dashboard-col">
                        <AllSessionsSection />
                    </Col>
                </Row>
            </section>
        </>
    )
}

export default MainDashboard