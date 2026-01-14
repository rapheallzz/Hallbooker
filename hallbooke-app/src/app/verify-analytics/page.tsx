
const SimpleComponent = ({ show, title }: { show: boolean, title: string }) => {
    return (
      <div>
        <h1>{title}</h1>
        {show && <h2 className="text-2xl font-bold mb-4">Reservation Analytics</h2>}
      </div>
    );
};

const VerifyAnalyticsPage = () => {
  return (
    <div className="p-4 bg-gray-100 space-y-8">
      <SimpleComponent title="With Reservation Analytics" show={true} />
      <SimpleComponent title="Without Reservation Analytics" show={false} />
    </div>
  );
};

export default VerifyAnalyticsPage;
