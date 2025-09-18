import { gql, useQuery } from '@apollo/client';

const HELLO_QUERY = gql`
  query HelloQuery {
    hello
  }
`;

function App() {
  const { data, loading, error } = useQuery(HELLO_QUERY);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Invoice Editor</h1>
      <div className="bg-gray-100 text-gray-900 p-6 rounded-lg">
        {
          loading ? <p>Loading...</p> :
          error ? <p>Error: {error.message}</p> :
          <p>
            Message from server: <strong>{data?.hello}</strong>
          </p>
        }
      </div>
    </div>
  );
}

export default App;