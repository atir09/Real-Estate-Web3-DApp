import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Home = ({ home, provider, account, escrow, togglePop }) => {
    const [seller, SetSeller] = useState(null)
    const [lender, SetLender] = useState(null)
    const [inspector, SetInspector] = useState(null)
    const [owner, setOwner] = useState(null)

    const [hasBought, setHasBought] = useState(null);
    const [hasInspected, setHasInspected] = useState(null);
    const [hasLended, setHasLended] = useState(null);
    const [hasSold, setHasSold] = useState(null);


    const fetchDetails = async () => {
        const hasBought = await escrow.earnestDeposited(home.id);
        setHasBought(hasBought);

        // Seller
        const seller = await escrow.seller();
        SetSeller(seller.toLowerCase());

        const hasSold = await escrow.approval(home.id, seller);
        setHasSold(hasSold);

        // Lender
        const lender = await escrow.lender();
        SetLender(lender.toLowerCase());
        const hasLended = await escrow.approval(home.id, lender);
        setHasLended(hasLended);

        // Inspector
        const inspector = await escrow.inspector();
        SetInspector(inspector.toLowerCase());
        const hasInspected = await escrow.inspectionStatus(home.id);
        setHasInspected(hasInspected);

    }

    const fetchOwner = async () => {
        if (await escrow.isListed(home.id)) return;

        const owner = await escrow.buyer(home.id);
        console.log("owner", owner)
        setOwner(owner);
    }

    useEffect(() => {
        fetchDetails();
        fetchOwner();
    }, [hasSold])

    const inspectHandler = async () => {
        console.log("Inside inspectHandler");

        if (!hasBought) {
            alert("The property has no Earnest Deposited.");
            return;
        }
        const signer = await provider.getSigner()
        const transaction = await escrow.connect(signer).updateInspectionStatus(home.id, true);
        await transaction.wait();
        console.log("inspecthandler", transaction);

    }

    const lendHandler = async () => {
        console.log("Inside lendHandler");
        if (!hasInspected) {
            alert("The inspection of the property has not been passed yet.");
            return;
        }
        const signer = await provider.getSigner()
        const transaction = await escrow.connect(signer).approveSale(home.id);
        await transaction.wait();
        console.log("lendhandler", transaction);

        const lendAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id));
        await signer.sendTransaction({ value: lendAmount.toString(), to: escrow.address, gasLimit: 60000 });
        setHasLended(true);
    }

    const sellHandler = async () => {
        console.log("Inside sellHandler");
        try {
            if (!hasInspected) {
                alert("The inspection of the property has not been passed yet.");
                return;
            }
            if (!hasLended) {
                alert("The Property has not been approved by the lender yet.");
                return;
            }
            const signer = await provider.getSigner();
            let transaction = await escrow.connect(signer).approveSale(home.id);
            await transaction.wait();
            console.log("Sellhandler", transaction);

            transaction = await escrow.connect(signer).finalizeSale(home.id);
            await transaction.wait();

            setHasSold(true)
        } catch (error) {
            console.log("Error during sell handler:", error);
            // If no revert reason is available, just display a generic error message
            alert("An error occurred during the transaction.");

        }

    }

    const buyHandler = async () => {
        console.log("Inside buyHandler");
        if (!account) {
            alert("Please Connect Your Metamask Wallet.");
            return;
        }
        const signer = await provider.getSigner();
        const escrowAmount = await escrow.escrowAmount(home.id);
        console.log("escrowAmount", escrowAmount, "Home-id", home.id);
        const transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount.toString() });
        await transaction.wait()
        console.log("buyHandler", transaction);


        setHasBought(true)
    }

    return (
        <div className="home">
            <div className='home__details'>
                <div className="home__image">
                    <img src={home.image} alt="Home" />
                </div>
                <div className="home__overview">
                    <h1>{home.name}</h1>
                    <p>
                        <strong>{home.attributes[2].value}</strong> bds |
                        <strong>{home.attributes[3].value}</strong> ba |
                        <strong>{home.attributes[4].value}</strong> sqft
                    </p>
                    <p>{home.address}</p>

                    <h2>{home.attributes[0].value} ETH</h2>
                    {console.log("owner", owner)
                    }

                    {owner ? (
                        <div className='home__owned'>
                            Owned by {owner.slice(0, 6) + '...' + owner.slice(38, 42)}
                        </div>
                    ) : (
                        <div>
                            {console.log("account", account)}
                            {(account === inspector) ? (
                                <button className='home__buy' onClick={inspectHandler} disabled={hasInspected}>
                                    {hasInspected ? "Inspection Approved" : "Approve Inspection"}
                                </button>
                            ) : (account === lender) ? (
                                <button className='home__buy' onClick={lendHandler} disabled={hasLended}>

                                    {hasLended ? "Lender Approved" : "Approve & Lend"}
                                </button>
                            ) : (account === seller) ? (
                                <button className='home__buy' onClick={sellHandler} disabled={hasSold}>
                                    {hasSold ? "Sold" : "Approve & Sell"}

                                </button>
                            ) : (
                                <button className='home__buy' onClick={buyHandler} disabled={hasBought}>
                                    {hasBought ? "Buy Initiated" : "Buy"}
                                </button>
                            )}

                            <button className='home__contact'>
                                Contact agent
                            </button>
                        </div>
                    )}

                    <hr />

                    <h2>Overview</h2>

                    <p>
                        {home.description}
                    </p>

                    <hr />

                    <h2>Facts and features</h2>

                    <ul>
                        {home.attributes.map((attribute, index) => (
                            <li key={index}><strong>{attribute.trait_type}</strong> : {attribute.value}</li>
                        ))}
                    </ul>
                </div>


                <button onClick={togglePop} className="home__close">
                    <img src={close} alt="Close" />
                </button>
            </div>
        </div >
    );
}

export default Home;
