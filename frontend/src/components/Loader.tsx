const Loader = () => {
  return <div className="loading"></div>;
};

export default Loader;

export const Skeleton = () => {
  return (
    <div className="skeleton-loader">
      <div className="skeleton-shapes"></div>
      <div className="skeleton-shapes"></div>
      <div className="skeleton-shapes"></div>
    </div>
  );
};
