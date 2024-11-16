import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

function App() {

  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [escrow, SetEscrow] = useState(null)
  const [realEstate, setRealEstate] = useState(null)
  const [homes, setHomes] = useState([])
  const [home, setHome] = useState({})
  const [toggle, setToggle] = useState(false)

  const loadBlockChainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider);

    const network = await provider.getNetwork();

    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
    setRealEstate(realEstate);
    const totalSupply = await realEstate.totalSupply()

    const homes = []

    for (let i = 0; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i);
      const metadata = JSON.parse(uri);
      console.log("metadata", metadata);
      homes.push(metadata)
    }
    setHomes(homes)

    const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider);
    SetEscrow(escrow);

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0])
      console.log("accounts", accounts);
    })
  }

  useEffect(() => {
    loadBlockChainData()
  }, [])

  const togglePop = (home) => {
    console.log("Inside ToglePopup.", home)
    setHome(home)
    setToggle(!toggle)
  }

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} provider={provider} />
      <Search />
      <div className='cards__section'>
        <h3>Properties:</h3>

        <hr />

        <div className='cards'>
          {homes.map((home, index) => (
            <div className='card' key={index} onClick={() => togglePop(home)}>
              <div className='card__image'>
                <img src={home.image} alt="Home" />
              </div>
              <div className='card__info'>
                <h4>{home.attributes[0].value} ETH</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong> bds |
                  <strong>{home.attributes[3].value}</strong> ba |
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toggle && (
        <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
      )}


    </div>
  );
}

export default App;
