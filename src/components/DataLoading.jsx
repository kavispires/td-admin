import { Alert, Spin } from 'antd';
import React from 'react';

function DataLoading({ loading, error, children }) {
  if (loading) {
    return <Spin tip="Loading...">{children}</Spin>;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" />;
  }

  return <>{children}</>;
}

export default DataLoading;
