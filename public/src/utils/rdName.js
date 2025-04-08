export default function randomEnglishNameEmail(domains) {
    const firstNames = ["John", "Emma", "Liam", "Olivia", "Noah", "Ava", "James", "Sophia", "Lucas", "Isabella"];
    const lastNames = ["Smith", "Johnson", "Brown", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin"];
    const randomNumber = Math.floor(Math.random() * 100000); // số từ 0 đến 999
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
  
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber}`;
    const fullName = `${firstName} ${lastName}`;
    const domainId = `${domain.id}`;
  
    return { fullName, email, domainId };
  }
  
  