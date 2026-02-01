import TopDashSection from "./TopDashSection"
import OpenSessionsSection from "./OpenSessionsSection"
import AllSessionsSection from "./AllSessionsSection"

const MainDashboard = () => {
    return (
        <>
            <TopDashSection />
            <section>
                <OpenSessionsSection />
                <AllSessionsSection />
            </section>
        </>
    )
}

export default MainDashboard