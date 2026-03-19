// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PariMutuel {
    
    // ─── Structures ───────────────────────────────────────────────────────────

    struct Match {
        string equipeDomicile;
        string equipeExterieur;
        string categorie;
        uint256 dateMatch;
        uint totalMiseA;
        uint totalMiseB;
        uint totalMiseNul;
        bool estClos;
        uint8 vainqueur;         // 0 = nul, 1 = domicile, 2 = extérieur, 255 = pas encore décidé
    }

    // ─── Variables d'état ─────────────────────────────────────────────────────

    address public admin;
    Match[] public matchs;
    mapping(uint => mapping(address => uint)) public misesUtilisateurs;
    mapping(uint => mapping(address => uint8)) public choixUtilisateurs;
    mapping(uint => mapping(address => uint)) public misesInitiales;

    // ─── Événements ───────────────────────────────────────────────────────────

    event MiseRetiree(uint indexed matchId, address indexed joueur, uint remboursement, uint penalite);

    // ─── Constructeur ─────────────────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
        matchs.push(Match("France", "Bresil", "Football", 1776625200, 0, 0, 0, false, 255));
    }

    receive() external payable {}

    // ─── Fonctions ADMIN ──────────────────────────────────────────────────────

    function creerMatch(string memory _equipeDomicile, string memory _equipeExterieur, string memory _categorie, uint256 _dateMatch) public {
        require(msg.sender == admin, "Seul l'admin peut creer un match");
        bytes memory domicile = bytes(_equipeDomicile);
        bytes memory exterieur = bytes(_equipeExterieur);
        require(domicile.length >= 2 && domicile.length <= 30, "Nom equipe domicile invalide");
        require(exterieur.length >= 2 && exterieur.length <= 30, "Nom equipe exterieur invalide");
        matchs.push(Match(_equipeDomicile, _equipeExterieur, _categorie, _dateMatch, 0, 0, 0, false, 255));
    }

    function cloreMatch(uint _matchId, uint8 _vainqueur) public {
        require(msg.sender == admin, "Admin uniquement");
        require(_matchId < matchs.length, "Match inexistant");
        require(!matchs[_matchId].estClos, "Deja clos");
        require(_vainqueur == 0 || _vainqueur == 1 || _vainqueur == 2, "Vainqueur 0, 1 ou 2");
        matchs[_matchId].estClos = true;
        matchs[_matchId].vainqueur = _vainqueur;
    }

    // ─── Fonctions CLIENT ─────────────────────────────────────────────────────

    function parier(uint256 _matchId, uint8 _choix) public payable {
        require(_matchId < matchs.length, "Match inexistant");
        require(!matchs[_matchId].estClos, "Match deja clos");
        require(matchs[_matchId].dateMatch == 0 || block.timestamp < matchs[_matchId].dateMatch, "Match deja commence");
        require(_choix == 0 || _choix == 1 || _choix == 2, "Choix invalide");
        require(msg.value > 0, "Mise nulle");
        require(misesUtilisateurs[_matchId][msg.sender] == 0, "Deja mise");

        misesUtilisateurs[_matchId][msg.sender] = msg.value;
        misesInitiales[_matchId][msg.sender] = msg.value;
        choixUtilisateurs[_matchId][msg.sender] = _choix;

        if (_choix == 1) {
            matchs[_matchId].totalMiseA += msg.value;
        } else if (_choix == 2) {
            matchs[_matchId].totalMiseB += msg.value;
        } else {
            matchs[_matchId].totalMiseNul += msg.value;
        }
    }

    function retirerMise(uint _matchId) public {
        require(_matchId < matchs.length, "Match inexistant");
        Match storage m = matchs[_matchId];
        require(!m.estClos, "Match deja clos");
        require(m.dateMatch == 0 || block.timestamp < m.dateMatch, "Match deja commence");
        require(misesUtilisateurs[_matchId][msg.sender] > 0, "Aucune mise active");

        uint mise = misesUtilisateurs[_matchId][msg.sender];
        uint penalite = (mise * 5) / 100;
        uint remboursement = mise - penalite;

        if (choixUtilisateurs[_matchId][msg.sender] == 1) {
            matchs[_matchId].totalMiseA -= mise;
        } else if (choixUtilisateurs[_matchId][msg.sender] == 2) {
            matchs[_matchId].totalMiseB -= mise;
        } else {
            matchs[_matchId].totalMiseNul -= mise;
        }

        misesUtilisateurs[_matchId][msg.sender] = 0;
        choixUtilisateurs[_matchId][msg.sender] = 255;

        (bool success, ) = payable(msg.sender).call{value: remboursement}("");
        require(success, "Remboursement echoue");
    }

    function retirerGains(uint _matchId) public {
        require(_matchId < matchs.length, "Match inexistant");
        Match storage m = matchs[_matchId];
        require(m.estClos, "Match non termine");
        require(misesUtilisateurs[_matchId][msg.sender] > 0, "Gains deja recuperes");

        uint misePerso = misesUtilisateurs[_matchId][msg.sender];
        misesUtilisateurs[_matchId][msg.sender] = 0;

        if (m.vainqueur == 0) {
            require(choixUtilisateurs[_matchId][msg.sender] == 0, "Pas gagnant");

            uint potTotal = m.totalMiseA + m.totalMiseB + m.totalMiseNul;
            uint gain = (misePerso * potTotal) / m.totalMiseNul;
            uint commissions = (gain * 10) / 100;
            uint gainNet = gain - commissions;

            (bool success, ) = payable(admin).call{value: commissions}("");
            (bool success2, ) = payable(msg.sender).call{value: gainNet}("");
            require(success, "Transfert commission echoue");
            require(success2, "Transfert gain echoue");
        } else {
            require(choixUtilisateurs[_matchId][msg.sender] == m.vainqueur, "Pas gagnant");

            uint potTotal = m.totalMiseA + m.totalMiseB + m.totalMiseNul;
            uint misesGagnantes = (m.vainqueur == 1) ? m.totalMiseA : m.totalMiseB;

            uint gain = (misePerso * potTotal) / misesGagnantes;
            uint commissions = (gain * 10) / 100;
            uint gainNet = gain - commissions;

            (bool success, ) = payable(admin).call{value: commissions}("");
            (bool success2, ) = payable(msg.sender).call{value: gainNet}("");
            require(success, "Transfert commission echoue");
            require(success2, "Transfert gain echoue");
        }
    }

    // ─── Fonctions de LECTURE ─────────────────────────────────────────────────

    function getDescriptionMatch(uint _matchId) public view returns (string memory) {
        require(_matchId < matchs.length, "Match inexistant");
        Match storage m = matchs[_matchId];
        return string(abi.encodePacked(m.equipeDomicile, " vs ", m.equipeExterieur));
    }

    function getMatchs() public view returns (Match[] memory) {
        return matchs;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}