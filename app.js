const KJC = "0x2FB9b0F45278D62dc13Dc9F826F78e8E3774047D";
const DF  = "0x36579d7eC4b29e875E3eC21A55F71C822E03A992";

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function decimals() view returns (uint8)"
];

let provider, signer, account;

const walletSpan = document.getElementById("wallet");
const successSpan = document.getElementById("successCount");
const failSpan = document.getElementById("failCount");
const progressBar = document.getElementById("progressBar");
const txLog = document.getElementById("txLog");

document.getElementById("btnConnect").onclick = async () => {
  if (!window.ethereum) return alert("Install MetaMask");

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();
  account = await signer.getAddress();

  walletSpan.textContent = account;
};

async function sendAirdrop(tokenAddress) {
  const listText = document.getElementById("airList").value.trim();
  if (!listText) return alert("No data");

  const lines = listText.split("\n");
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const decimals = await token.decimals();

  let success = 0;
  let fail = 0;

  for (let i = 0; i < lines.length; i++) {
    const [addr, amt] = lines[i].split(",");
    if (!addr || !amt) continue;

    try {
      const amount = ethers.parseUnits(amt.trim(), decimals);
      const tx = await token.transfer(addr.trim(), amount);
      txLog.innerHTML += `⏳ Sending to ${addr}...<br>`;
      await tx.wait();

      success++;
      txLog.innerHTML += `✅ ${addr} TX: ${tx.hash}<br>`;
    } catch (err) {
      fail++;
      txLog.innerHTML += `❌ ${addr} Failed<br>`;
    }

    successSpan.textContent = success;
    failSpan.textContent = fail;

    progressBar.style.width = `${((i+1)/lines.length)*100}%`;
  }
}

document.getElementById("btnSendKJC").onclick = () => sendAirdrop(KJC);
document.getElementById("btnSendDF").onclick = () => sendAirdrop(DF);
