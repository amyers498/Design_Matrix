import fetch from 'isomorphic-unfetch'


const Home = ({ matrices }) => {
  console.log(matrices)

  return (
    <div className="container">
      {matrices.map(matrix=>(
        <div>
          {matrix.Title}
        </div>
      ))}
      
    </div>
  );
      }  
export async function getServerSideProps() {
    const { API_URL } = process.env

    const res = await fetch(`${API_URL}/matrices`)
    const data = await res.json()

    return {
        props: {
          matrices: data
        }
    }
}

export default Home
