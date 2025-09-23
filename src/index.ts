import express from "express";

const app = express();

interface Asset {
  id: number;
  name: string;
  price: number;
  picture: string;
}

const cars: Asset[] = [
  {
    id: 1,
    name: "Tesla Model S",
    price: 79990,
    picture: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400",
  },
  {
    id: 2,
    name: "BMW 3 Series",
    price: 41000,
    picture: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400",
  },
  {
    id: 3,
    name: "Mercedes-Benz C-Class",
    price: 43000,
    picture:
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400",
  },
  {
    id: 4,
    name: "Audi A4",
    price: 39000,
    picture:
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400",
  },
  {
    id: 5,
    name: "Honda Civic",
    price: 23000,
    picture:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400",
  },
  {
    id: 6,
    name: "Toyota Camry",
    price: 25000,
    picture:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400",
  },
  {
    id: 7,
    name: "Ford Mustang",
    price: 27000,
    picture:
      "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400",
  },
  {
    id: 8,
    name: "Chevrolet Corvette",
    price: 60000,
    picture: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    id: 9,
    name: "Porsche 911",
    price: 114200,
    picture:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400",
  },
  {
    id: 10,
    name: "Lamborghini Huracan",
    price: 261000,
    picture: "https://images.unsplash.com/photo-1544829099-b9a0e794ab3a?w=400",
  },
];

const boats: Asset[] = [
  {
    id: 1,
    name: "Boston Whaler 170 Montauk",
    price: 25000,
    picture: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  },
  {
    id: 2,
    name: "Sea Ray Sundancer 320",
    price: 650000,
    picture: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  },
  {
    id: 3,
    name: "Beneteau Oceanis 38.1",
    price: 450000,
    picture: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  },
  {
    id: 4,
    name: "Jeanneau Sun Odyssey 389",
    price: 350000,
    picture: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  },
  {
    id: 5,
    name: "Tartan 4000",
    price: 550000,
    picture: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  },
  {
    id: 6,
    name: "Catalina 385",
    price: 300000,
    picture: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  },
  {
    id: 7,
    name: "Hunter 356",
    price: 180000,
    picture: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  },
  {
    id: 8,
    name: "Dufour 390 Grand Large",
    price: 420000,
    picture: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  },
  {
    id: 9,
    name: "Beneteau Swift Trawler 35",
    price: 850000,
    picture: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  },
  {
    id: 10,
    name: "Ranger Tugs R-31",
    price: 1200000,
    picture: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
  },
];

const houses: Asset[] = [
  {
    id: 1,
    name: "Colonial House",
    price: 450000,
    picture:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400",
  },
  {
    id: 2,
    name: "Victorian House",
    price: 650000,
    picture:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400",
  },
  {
    id: 3,
    name: "Modern Villa",
    price: 1200000,
    picture:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
  },
  {
    id: 4,
    name: "Cottage",
    price: 300000,
    picture:
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=400",
  },
  {
    id: 5,
    name: "Townhouse",
    price: 550000,
    picture:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400",
  },
  {
    id: 6,
    name: "Bungalow",
    price: 400000,
    picture:
      "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=400",
  },
  {
    id: 7,
    name: "Mansion",
    price: 2500000,
    picture:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400",
  },
  {
    id: 8,
    name: "Apartment",
    price: 350000,
    picture: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
  },
  {
    id: 9,
    name: "Cabin",
    price: 250000,
    picture:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400",
  },
  {
    id: 10,
    name: "Penthouse",
    price: 2000000,
    picture: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
  },
];

const planes: Asset[] = [
  {
    id: 1,
    name: "Cessna 172 Skyhawk",
    price: 400000,
    picture:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  },
  {
    id: 2,
    name: "Piper Cherokee",
    price: 250000,
    picture:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  },
  {
    id: 3,
    name: "Beechcraft Bonanza",
    price: 800000,
    picture:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  },
  {
    id: 4,
    name: "Cirrus SR22",
    price: 600000,
    picture:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  },
  {
    id: 5,
    name: "Diamond DA40",
    price: 500000,
    picture:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  },
  {
    id: 6,
    name: "Mooney M20",
    price: 350000,
    picture:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  },
  {
    id: 7,
    name: "Columbia 400",
    price: 450000,
    picture:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  },
  {
    id: 8,
    name: "Tecnam P2002",
    price: 200000,
    picture:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  },
  {
    id: 9,
    name: "Pipistrel Virus",
    price: 150000,
    picture:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  },
  {
    id: 10,
    name: "Flight Design CTSW",
    price: 180000,
    picture:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  },
];

const welcomeStrings = [
  "Hello Express!",
  "To learn more about Express on Vercel, visit https://vercel.com/docs/frameworks/backend/express",
];

app.get("/", (_req, res) => {
  res.send(welcomeStrings.join("\n\n"));
});

app.get("/cars", (_req, res) => {
  res.json(cars);
});

app.get("/boats", (_req, res) => {
  res.json(boats);
});

app.get("/houses", (_req, res) => {
  res.json(houses);
});

app.get("/planes", (_req, res) => {
  res.json(planes);
});

export default app;
