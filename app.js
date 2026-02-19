(() => {
  "use strict";

  const C = window.APP_CONFIG;
  const $ = id => document.getElementById(id);

  let provider, signer, user;

  const ERC20_ABI = [
    "function decimals() view returns(uint8)",
    "function transfer(address to, uint256 amount) returns(bool)"
  ];

  async function connect() {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    user = await signer.getAddress();
    $("wallet").textContent = user;
  }

  function parseList(text) {
    const lines = text.split("\n").map(x => x.trim()).filter(Boolean);
    const list = [];

    for (const line of lines) {
      const [addr, amount] = line.split(",");
      if (!addr || !amount) continue;
      list.push({ addr: addr.trim(), amount: amount.trim() });
    }

    return list;
  }

  async function airdrop(tokenAddr) {
    const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
    const dec = await token.decimals();

    const list = parseList($("airList").value);
    if (list.length === 0) return alert("No data");

    for (let i = 0; i < list.length; i++) {
      const amt = ethers.utils.parseUnits(list[i].amount, dec);
      const tx = await token.transfer(list[i].addr, amt);
      await tx.wait();
      console.log("Sent to", list[i].addr);
    }

    alert("Airdrop completed");
  }

  window.addEventListener("load", () => {
    $("btnConnect").onclick = connect;
    $("btnSendKJC").onclick = () => airdrop(C.KJC);
    $("btnSendDF").onclick = () => airdrop(C.DF);
  });

})();
