import { gql, useQuery } from '@apollo/client';
import './App.css';

const HELLO_QUERY = gql`
  query HelloQuery {
    hello
  }
`;

function App() {
  const { data, loading, error } = useQuery(HELLO_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <h1>Invoice Editor</h1>
      <div className="card">
        <p>
          Message from server: <strong>{data?.hello}</strong>
        </p>
      </div>
    </>
  );
}

export default App;