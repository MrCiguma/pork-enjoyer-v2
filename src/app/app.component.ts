import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { CommonModule, formatDate } from "@angular/common";
import {
  Map,
  Position,
  Tile,
  Oasis,
  Animal,
  AnimalData,
  OasisType,
  Sim,
  Resource,
} from "./app.model";
import { HttpClient, HttpClientModule, HttpParams } from "@angular/common/http";
import "@angular/compiler";
import {
  Component,
  enableProdMode,
  importProvidersFrom,
  NgModule,
  ViewChild,
} from "@angular/core";
import { MatSort, Sort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { FormsModule } from "@angular/forms";
import {
  BrowserAnimationsModule,
  provideAnimations,
} from "@angular/platform-browser/animations";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    HttpClientModule,
    MatTableModule,
    MatSortModule,
    FormsModule,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  x: number = 0;
  y: number = 0;
  baseUrl: string = "https://ts9.x1.international.travian.com/";
  unitsLvl: number = 0;
  basePower: number = 120;
  unitCost: number = 895;
  unitCost2: number = 895;
  minUnits: number = 0;
  minUnits2: number = 0;
  maxUnits: number = 10000;
  maxUnits2: number = 10000;
  maxLoss: number = 1;
  maxLoss2: number = 1;
  show: boolean = false;
  consumption: number = 2;
  cavalry: boolean = true;
  cavalry2: boolean = true;
  capacity: number = 75;
  capacity2: number = 75;
  unitId: number[] = [4];
  unitId2: number[] = [4];
  gameSpeed: number = 1;
  showHero: boolean = false;
  fightingStrength: number = 0;
  damageReduction: number = 0;
  minDelay: number = 0;
  unitCalculatedPower: number = 0;
  unitCalculatedPower2: number = 0;
  deleteOnClick: boolean = false;
  valueTime: boolean = true;
  valueRaid: boolean = true;
  tabName: string = "PorkEnjoyer";
  defaultEmpty: number = 0;
  lossReduceId: number = 0;
  lossReduceRatio: number = 0;
  lossReducePower: number = 0;
  lossReduceCost: number = 0;
  lossReduceCavalry: boolean = true;
  handledOases: Set<string> = new Set();
  demoteSpawning: boolean = false;
  parameterList: String[] = [
    "x",
    "y",
    "baseUrl",
    "unitCost",
    "minUnits",
    "maxUnits",
    "cavalry",
    "unitId",
    "unitCalculatedPower",
    "capacity",
    "unitCost2",
    "minUnits2",
    "maxUnits2",
    "cavalry2",
    "unitId2",
    "unitCalculatedPower2",
    "capacity2",
    "maxLoss",
    "maxLoss2",
    "lossReduceId",
    "lossReduceRatio",
    "lossReducePower",
    "lossReduceCost",
    "lossReduceCavalry",
    "show",
    "gameSpeed",
    "showHero",
    "fightingStrength",
    "damageReduction",
    "deleteOnClick",
    "minDelay",
    "valueTime",
    "valueRaid",
    "tabName",
    "defaultEmpty",
    "demoteSpawning",
  ];

  announceSortChange($event: Sort) {
    console.log($event);
  }
  hits = "";
  oases: Oasis[] = [];
  data: AnimalData[] = [];
  totalClicked = 0;
  totalSuggested = 0;
  totalRaid = 0;
  totalAnimals = 0;
  totalLoss = 0;

  displayedColumns: string[] = [
    "value",
    "value2",
    "valueAnimals",
    "totalRes",
    "distance",
    "animals",
    "resInOasis",
    "link",
    "unitsNeeded",
    "suggestedSim",
    "suggestedSim2",
    "cleanAnimals",
    "heroXpDamage",
    "heroXpTime",
  ];

  dataSource: any;
  rawData: any[] = [];

  @ViewChild(MatSort) sort: MatSort = new MatSort();

  ngAfterViewInit() {}

  private httpClient: HttpClient;
  private title: Title;

  constructor(http: HttpClient, private titleService: Title) {
    this.httpClient = http;
    this.title = titleService;
    this.readData();
  }

  ngOnInit() {
    this.parameterList.forEach((key) => {
      let queryParam = this.getParamValueQueryString(key.toString());
      if (queryParam) {
        // @ts-ignore
        if (typeof this[key.toString()] == "number") {
          // @ts-ignore
          this[key as keyof AppComponent] = parseFloat(queryParam);
          return;
        }
        // @ts-ignore
        if (typeof this[key.toString()] == "boolean") {
          // @ts-ignore
          this[key as keyof AppComponent] = JSON.parse(queryParam);
          return;
        }
        // @ts-ignore
        if (typeof this[key.toString()] == "object") {
          console.log(key.toString());
          // @ts-ignore
          this[key as keyof AppComponent] = queryParam.split(",").map(Number);
          return;
        }
        // @ts-ignore
        this[key as keyof AppComponent] = queryParam;
      }
    });

    console.log(this.tabName);
    this.title.setTitle(this.tabName);
  }

  getParamValueQueryString(paramName: string): string | null | undefined {
    const url = window.location.href;
    let paramValue;
    if (url.includes("?")) {
      const httpParams = new HttpParams({ fromString: url.split("?")[1] });
      paramValue = httpParams.get(paramName);
    }
    return paramValue;
  }

  printCurrentParams() {
    let result = "?";
    this.parameterList.forEach((param) => {
      result += `${param}=${this[param as keyof AppComponent]}&`;
    });
    console.log(result);
  }

  calc(map: string) {
    console.log("start" + new Date().toISOString());
    this.printCurrentParams();
    let obj: Map = JSON.parse(map);

    obj.tiles.forEach((t: Tile) => {
      let o = this.parse(t);
      if (o && this.isNew(o)) {
        this.oases.push(o);
      }
    });

    this.hits = "ww";
    this.rawData = [...this.rawData, ...this.oasesToGrid()];
    this.dataSource = new MatTableDataSource(this.rawData);
    this.dataSource.sort = this.sort;
    console.log(this.oases.length);
    console.log(this.rawData.length);
    console.log("end" + new Date().toISOString());
  }

  oasesToGrid(): any[] {
    let dataSource: {
      resInOasis: number;
      animals: string;
      valueAnimals: number;
      unitsNeeded: number;
      marksNeeded: number;
      totalRes: number;
      distance: number;
      value: number;
      value2: number;
      link: string;
      unitsLink: string;
      heroLink: string;
      suggestedSim: Sim;
      suggestedSim2: Sim;
      suggestedRainbow: Sim;
      cleanAnimals: string[];
    }[] = [];

    this.oases.forEach((o: Oasis) => {
      const key = `${o.position.x}:${o.position.y}`;
      if (this.handledOases.has(key)) {
        return;
      }
      this.handledOases.add(key);

      if (Math.round(o.currentRes + this.animalToRes(o.animals, 1)) < 1) return;
      let mapId = (200 - o.position.y) * 401 + (201 + o.position.x);
      let row = {
        resInOasis: Math.round(o.currentRes),
        animals: this.animalToString(o.animals),
        unitsNeeded: Math.round(o.currentRes / this.capacity),
        marksNeeded: Math.round(o.currentRes / 105),
        totalRes: Math.round(o.currentRes + this.animalToRes(o.animals, 1)),
        distance: Math.round(this.calcDistance(o.position)),
        value: 0,
        value2: 0,
        valueAnimals: 0,
        link: this.getLink(o.position),
        unitsLink: "",
        heroLink: "",
        suggestedSim: this.getSuggestedByProfile(
          o.animals,
          Math.max(Math.round(o.currentRes / this.capacity), this.minUnits + 1),
          mapId,
          1,
          o.currentRes
        ),
        suggestedSim2: this.getSuggestedByProfile(
          o.animals,
          this.lossReducePower > 0
            ? Math.max(
                Math.round(o.currentRes / this.capacity),
                this.minUnits + 1
              )
            : Math.max(
                Math.round(o.currentRes / this.capacity2),
                this.minUnits2 + 1
              ),
          mapId,
          2,
          o.currentRes
        ),
        suggestedRainbow: this.getSuggestedRainbow(
          o.animals,
          Math.round(o.currentRes / (75 + 105 + 80))
        ),
        heroXpDamage: 0,
        heroXpTime: 0,
        heroXp: 0,
        heroDamage: 0,
        cleanAnimals: [],
      };

      row.value =
        (row.resInOasis * (this.valueRaid ? 1 : 0) +
          row.suggestedSim.bounty -
          row.suggestedSim.losses) /
        row.suggestedSim.number;

      row.value2 =
        (row.resInOasis * (this.valueRaid ? 1 : 0) +
          row.suggestedSim2.bounty -
          row.suggestedSim2.losses) /
        row.suggestedSim2.number;

      if (this.valueTime) {
        row.value /= row.distance;
        row.value2 /= row.distance;
      }

      row.value = Math.round(row.value * 1000);
      row.value2 = Math.round(row.value2 * 1000);

      if (!row.value) row.value = 0;
      if (!row.value2) row.value2 = 0;

      if (this.lossReduceRatio > 0 && row.value2 > row.value) {
        row.suggestedSim = row.suggestedSim2;
      }
      row.valueAnimals =
        (row.suggestedSim.bounty - o.currentRes - row.suggestedSim.losses) /
        row.suggestedSim.number;
      row.valueAnimals /= row.distance;
      row.valueAnimals = Math.round(row.valueAnimals * 1000);

      if (row.valueAnimals == 0 && row.value > 0 && this.defaultEmpty != 0) {
        row.suggestedSim.number = this.defaultEmpty;
        const troopParams = this.unitId
          .map((id) => `&troop[t${id}]=${this.defaultEmpty}`)
          .join("");
        row.suggestedSim.link = `${this.baseUrl}build.php?gid=16&tt=2&eventType=4&targetMapId=${mapId}${troopParams}`;
      }

      const troopParams = this.unitId
        .map((id) => `&troop[t${id}]=${row.unitsNeeded}`)
        .join("");
      row.unitsLink = `${this.baseUrl}build.php?gid=16&tt=2&eventType=4&targetMapId=${mapId}${troopParams}`;
      row.heroLink = `${this.baseUrl}build.php?gid=16&tt=2&eventType=4&targetMapId=${mapId}&troop[t11]=1`;

      row.suggestedRainbow.link = `${this.baseUrl}build.php?gid=16&tt=2&eventType=4&targetMapId=${mapId}&troop[t4]=${row.suggestedRainbow.number}&troop[t5]=${row.suggestedRainbow.number}&troop[t6]=${row.suggestedRainbow.number}`;

      let heroSim = this.calcLossHero(o.animals);
      row.heroXp = heroSim[1] / 160;
      row.heroDamage = Math.max(0, heroSim[0] * 100 - this.damageReduction);
      row.heroXpTime = row.heroXp / row.distance;
      row.heroXpDamage =
        row.heroXp / (row.heroDamage == 0 ? 1 : row.heroDamage);

      let tempAnimals: Animal[] = o.animals.map((a) => ({ ...a }));

      row.cleanAnimals = this.cleanAnimals(
        tempAnimals,
        this.minUnits,
        row.suggestedSim,
        mapId,
        1,
        row.resInOasis
      );

      if (
        (row.suggestedSim.number > this.minUnits &&
          row.suggestedSim.number < this.maxUnits &&
          row.value > 0) ||
        (row.suggestedSim.number == this.defaultEmpty &&
          this.defaultEmpty > 0 &&
          row.value > 0)
      ) {
        this.totalSuggested += row.suggestedSim.number;

        if (this.demoteSpawning && this.isSpawning(o)) {
          if (row.value > 0) row.value *= -1;
          if (row.value2 > 0) row.value2 *= -1;
        }

        dataSource.push(row);
      }
    });

    return dataSource;
  }

  private isSpawning(o: Oasis): boolean {
    if (!o?.animals || o.animals.length === 0) return false;

    // Resource → last-spawner threshold (inclusive)
    const lastSpawnerThreshold: Record<Resource, number> = {
      [Resource.Wood]: 37,
      [Resource.Clay]: 35,
      [Resource.Iron]: 34,
      [Resource.Crop]: 39,
    };

    const threshold = lastSpawnerThreshold[o.resType];

    // Only animals that exist
    const present = o.animals.filter((a) => a.count > 0);

    const totalAnimals = present.reduce((sum, a) => sum + a.count, 0);
    const lastSpawners = present.filter((a) => a.id >= threshold);

    // Rule 1: no last spawner AND ≥ 6 total animals → spawning
    if (lastSpawners.length === 0 && totalAnimals >= 6) {
      return true;
    }

    // Rule 2: ≥ 2 last spawners → not spawning
    if (lastSpawners.length >= 2) {
      return false;
    }

    // Rule 3: exactly one last spawner → ratio check
    if (lastSpawners.length === 1) {
      const ls = lastSpawners[0];

      // candidates strictly below last spawner id, highest id first
      const prevCandidates = present
        .filter((a) => a.id < ls.id)
        .sort((a, b) => b.id - a.id);

      // pick immediate previous; if its count < 4, pick the next previous
      let prev = prevCandidates[0] ?? null;
      if (prev && prev.count < 4) {
        prev = prevCandidates[1] ?? null;
      }

      if (!prev) return false; // no valid comparator → not spawning

      // ratio thresholds by last spawner id
      const ratioThresholdById: Record<number, number> = {
        37: 0.4, // wood
        35: 0.33, // clay
        34: 0.66, // iron
        39: 0.5, // crop (updated)
      };

      const limit = ratioThresholdById[ls.id];
      if (typeof limit !== "number" || prev.count <= 0) {
        return false;
      }

      const ratio = (ls.count + 1) / prev.count;
      return ratio < limit;
    }

    return false;
  }

  getSuggestedRainbow(animals: Animal[], minRainbow: number): Sim {
    let rainbowNumber = minRainbow;
    let sim: Sim = {
      link: "",
      number: rainbowNumber,
      percent: 0,
      bounty: 0,
      losses: 0,
      offLosses: 0,
    };

    let maxValue = 0;

    let step = 1;

    while (rainbowNumber < 1000) {
      let lossRatio = this.calcLossRatioRainbow(rainbowNumber, animals);
      let losses = lossRatio[1];
      let bounty = lossRatio[2];

      let value = (bounty - losses) / rainbowNumber;

      if (value > maxValue && lossRatio[0] < this.maxLoss) {
        maxValue = value;
        sim.number = rainbowNumber + 1;
        sim.percent = lossRatio[0];
        sim.bounty = bounty;
        sim.losses = losses;
      }

      rainbowNumber += step;
      if (rainbowNumber % 100 < step) {
        step += 2;
      }
    }

    return sim;
  }

  getSuggestedMixed(
    animals: Animal[],
    minUnits: any,
    mapId: number,
    unitCost: number,
    maxUnits: number,
    maxLoss: number,
    unitId: number[],
    unitCalculatedPower: number,
    cavalry: number,
    lossReduceCost: number,
    lossReduceId: number,
    lossReducePower: number,
    lossReduceRatio: number,
    lossReduceCavalry: number,
    resInOasis: number
  ): Sim {
    let unitsNumber = minUnits;
    let sim: Sim = {
      link: "",
      number: unitsNumber,
      percent: 0,
      bounty: 0,
      losses: unitsNumber * unitCost,
      offLosses: 0,
    };

    let maxValue = -1;

    let step = 1;

    while (unitsNumber < maxUnits) {
      let lossRatio = this.calcLossRatioMixed(
        unitsNumber,
        Math.round(unitsNumber * lossReduceRatio),
        animals,
        unitCalculatedPower,
        lossReducePower,
        unitCost,
        lossReduceCost,
        cavalry,
        lossReduceCavalry,
        resInOasis
      );
      let losses = lossRatio[1];
      let bounty = lossRatio[2];

      let value = (bounty - losses) / unitsNumber;

      if (value > maxValue && lossRatio[0] < maxLoss) {
        maxValue = value;
        sim.number = unitsNumber + 3;
        sim.percent = lossRatio[0];
        sim.bounty = bounty;
        sim.losses = losses;
        sim.offLosses = lossRatio[3];
      }

      unitsNumber += step;
      if (unitsNumber % 100 < step) {
        step += 2;
      }
    }

    const troopParams = `&troop[t${unitId}]=${
      sim.number
    }&troop[t${lossReduceId}]=${Math.round(sim.number * lossReduceRatio)}`;
    sim.link = `${this.baseUrl}build.php?gid=16&tt=2&eventType=4&targetMapId=${mapId}${troopParams}`;
    return sim;
  }

  getSuggested(
    animals: Animal[],
    minUnits: any,
    mapId: number,
    unitCost: number,
    maxUnits: number,
    maxLoss: number,
    unitId: number[],
    unitCalculatedPower: number,
    cavalry: number,
    resInOasis: number
  ): Sim {
    let unitsNumber = minUnits;
    let sim: Sim = {
      link: "",
      number: unitsNumber,
      percent: 0,
      bounty: 0,
      losses: unitsNumber * unitCost,
      offLosses: 0,
    };

    let maxValue = -1;

    let step = 1;

    while (unitsNumber < maxUnits) {
      let lossRatio = this.calcLossRatio(
        unitsNumber,
        animals,
        unitCalculatedPower,
        unitCost,
        cavalry,
        resInOasis
      );
      let losses = lossRatio[1];
      let bounty = lossRatio[2];

      let value = (bounty - losses) / unitsNumber;

      if (value > maxValue && lossRatio[0] < maxLoss) {
        maxValue = value;
        sim.number = unitsNumber + 3;
        sim.percent = lossRatio[0];
        sim.bounty = bounty;
        sim.losses = losses;
        sim.offLosses = lossRatio[3];
      }

      unitsNumber += step;
      if (unitsNumber % 100 < step) {
        step += 2;
      }
    }

    const troopParams = unitId
      .map((id) => `&troop[t${id}]=${sim.number}`)
      .join("");
    sim.link = `${this.baseUrl}build.php?gid=16&tt=2&eventType=4&targetMapId=${mapId}${troopParams}`;
    return sim;
  }

  cleanAnimals(
    animals: Animal[],
    minUnits: any,
    firstAttack: Sim,
    mapId: number,
    unitProfile: number,
    resInOasis: number
  ): any {
    var links: string[] = [];

    links.push(firstAttack.link);
    animals = calculateRemains(animals, 1 - firstAttack.offLosses);

    while (animals.length > 0) {
      let nextAttack = this.getSuggestedByProfile(
        animals,
        minUnits,
        mapId,
        unitProfile,
        resInOasis
      );
      links.push(nextAttack.link);
      animals = calculateRemains(animals, 1 - nextAttack.offLosses);
    }
    return links;
  }

  getSuggestedByProfile(
    animals: Animal[],
    minUnits: any,
    mapId: number,
    unitProfile: number,
    resInOasis: number
  ): Sim {
    if (unitProfile == 1) {
      return this.getSuggested(
        animals,
        minUnits,
        mapId,
        this.unitCost,
        this.maxUnits,
        this.maxLoss,
        this.unitId,
        this.unitCalculatedPower,
        this.cavalry ? 1 : 0,
        resInOasis
      );
    } else if (this.lossReducePower > 0) {
      return this.getSuggestedMixed(
        animals,
        minUnits,
        mapId,
        this.unitCost,
        this.maxUnits,
        this.maxLoss,
        this.unitId,
        this.unitCalculatedPower,
        this.cavalry ? 1 : 0,
        this.lossReduceCost,
        this.lossReduceId,
        this.lossReducePower,
        this.lossReduceRatio,
        this.lossReduceCavalry ? 1 : 0,
        resInOasis
      );
    } else if (unitProfile == 2 && this.unitCalculatedPower2 > 0) {
      return this.getSuggested(
        animals,
        minUnits,
        mapId,
        this.unitCost2,
        this.maxUnits2,
        this.maxLoss2,
        this.unitId2,
        this.unitCalculatedPower2,
        this.cavalry2 ? 1 : 0,
        resInOasis
      );
    } else {
      return this.getSuggested(
        animals,
        minUnits,
        mapId,
        this.unitCost,
        this.maxUnits,
        this.maxLoss,
        this.unitId,
        this.unitCalculatedPower,
        this.cavalry ? 1 : 0,
        resInOasis
      );
    }
  }

  calcLossRatioRainbow(rainbowNumber: number, animals: Animal[]): number[] {
    // https://blog.travian.com/sl/2023/10/game-secrets-smithy-and-total-strength-of-an-army/
    let units = [
      {
        basePower: 120,
        consumption: 2,
        level: 20,
        cost: 895,
      },
      {
        basePower: 110,
        consumption: 2,
        level: 20,
        cost: 1050,
      },
      {
        basePower: 120,
        consumption: 2,
        level: 20,
        cost: 1760,
      },
    ];

    let offPower = 0;
    let cost = 0;

    units.forEach((u) => {
      offPower +=
        u.basePower +
        (u.basePower + (300 * u.consumption) / 7) *
          (Math.pow(1.007, u.level) - 1);
      cost += u.cost;
    });

    offPower *= rainbowNumber * 1.08;

    let deffPower = this.animalToDeff(animals, 1) + 10;

    if (offPower < deffPower) return [5, 5, 5];

    // https://blog.travian.com/2023/09/game-secrets-combat-system-formulas-written-by-kirilloid/
    let ratioX = Math.pow(deffPower / offPower, 1.5);
    let losses = ratioX / (1 + ratioX);

    let bounty = this.animalToRes(animals, 1 - losses);
    let result: number[] = [];
    result.push((Math.round(rainbowNumber * losses) * cost) / bounty);
    result.push(Math.round(rainbowNumber * losses) * cost);
    result.push(bounty);
    return result;
  }

  calcLossHero(animals: Animal[]): number[] {
    let offPower = this.fightingStrength;
    let deffPower = this.animalToDeff(animals, 1) + 10;
    let offWins = true;
    let ratioX = Math.pow(deffPower / offPower, 1.5);

    if (offPower < deffPower) {
      offWins = false;
      ratioX = Math.pow(offPower / deffPower, 1.5);
    }

    // https://blog.travian.com/2023/09/game-secrets-combat-system-formulas-written-by-kirilloid/
    let losses = ratioX / (1 + ratioX);

    let bounty = this.animalToRes(animals, !offWins ? losses : 1 - losses);
    let result: number[] = [];
    result.push(offWins ? losses : 1 - losses);
    result.push(bounty);
    return result;
  }

  calcLossRatioMixed(
    unitsNumber1: number,
    unitsNumber2: number,
    animals: Animal[],
    unitCalculatedPower1: number,
    unitCalculatedPower2: number,
    unitCost1: number,
    unitCost2: number,
    cavalry1: number,
    cavalry2: number,
    resInOasis: number
  ): number[] {
    // https://blog.travian.com/sl/2023/10/game-secrets-smithy-and-total-strength-of-an-army/
    let offPower =
      unitsNumber1 * unitCalculatedPower1 + unitsNumber2 * unitCalculatedPower2;

    let cavOff =
      unitsNumber1 * unitCalculatedPower1 * cavalry1 +
      unitsNumber2 * unitCalculatedPower2 * cavalry2;

    let deffPower = this.animalToDeff(animals, cavOff / offPower) + 10;

    let offWins = true;
    let nUnits = unitsNumber1 + unitsNumber2;
    animals.forEach((a) => (nUnits += a.count));
    let massArmyExponent = 2 * (1.8592 - Math.pow(nUnits, 0.015));
    massArmyExponent = Math.min(massArmyExponent, 1.5);

    let ratioX = Math.pow(deffPower / offPower, massArmyExponent);
    if (offPower < deffPower) {
      offWins = false;
      ratioX = Math.pow(offPower / deffPower, massArmyExponent);
    }

    // https://blog.travian.com/2023/09/game-secrets-combat-system-formulas-written-by-kirilloid/
    let losses = ratioX / (1 + ratioX);
    let offLosses = offWins ? losses : 1 - losses;

    let bounty =
      this.animalToRes(animals, 1 - offLosses) +
      (this.valueRaid ? 1 : 0) * resInOasis;

    if (unitsNumber1 == 3688) {
      console.log(bounty);
      console.log(unitsNumber1);
    }
    let result: number[] = [];
    result.push(
      (Math.round(unitsNumber1 * offLosses) * unitCost1 +
        Math.round(unitsNumber2 * offLosses) * unitCost2) /
        Math.max(bounty, 1)
    );
    result.push(
      Math.round(unitsNumber1 * offLosses) * unitCost1 +
        Math.round(unitsNumber2 * offLosses) * unitCost2
    );
    result.push(bounty);
    result.push(offLosses);

    return result;
  }

  calcLossRatio(
    unitsNumber: number,
    animals: Animal[],
    unitCalculatedPower: number,
    unitCost: number,
    cavalry: number,
    resInOasis: number
  ): number[] {
    // https://blog.travian.com/sl/2023/10/game-secrets-smithy-and-total-strength-of-an-army/
    let offPower = unitsNumber * unitCalculatedPower;

    let deffPower = this.animalToDeff(animals, cavalry) + 10;

    let offWins = true;
    let nUnits = unitsNumber;
    animals.forEach((a) => (nUnits += a.count));
    let massArmyExponent = 2 * (1.8592 - Math.pow(nUnits, 0.015));
    massArmyExponent = Math.min(massArmyExponent, 1.5);

    let ratioX = Math.pow(deffPower / offPower, massArmyExponent);
    if (offPower < deffPower) {
      offWins = false;
      ratioX = Math.pow(offPower / deffPower, massArmyExponent);
    }

    // https://blog.travian.com/2023/09/game-secrets-combat-system-formulas-written-by-kirilloid/
    let losses = ratioX / (1 + ratioX);
    let offLosses = offWins ? losses : 1 - losses;

    let bounty =
      this.animalToRes(animals, 1 - offLosses) +
      (this.valueRaid ? 1 : 0) * resInOasis;

    let result: number[] = [];
    result.push(
      (Math.round(unitsNumber * offLosses) * unitCost) / Math.max(bounty, 1)
    );
    result.push(Math.round(unitsNumber * offLosses) * unitCost);
    result.push(bounty);
    result.push(offLosses);

    return result;
  }

  getLink(position: Position) {
    return `${this.baseUrl}karte.php?x=` + position.x + "&y=" + position.y;
  }

  calcDistance(position: Position) {
    let xDist = Math.min(
      Math.abs(position.x - this.x),
      401 - Math.abs(position.x - this.x)
    );
    let yDist = Math.min(
      Math.abs(position.y - this.y),
      401 - Math.abs(position.y - this.y)
    );

    return Math.sqrt(xDist * xDist + yDist * yDist);
  }

  animalToRes(animals: Animal[], ratio: number): number {
    let sum = 0;
    animals.forEach((a: Animal) => {
      let res = this.data.find((v: AnimalData) => v.id == a.id)?.res;
      if (res) {
        sum += Math.round(a.count * ratio) * res;
      }
    });
    return sum;
  }

  animalToDeff(animals: Animal[], cavalry: number) {
    let sum = 0;
    animals.forEach((a: Animal) => {
      let cavDeff = this.data.find((v: AnimalData) => v.id == a.id)?.[
        "cavDeff"
      ];
      let infDeff = this.data.find((v: AnimalData) => v.id == a.id)?.[
        "infDeff"
      ];
      if (cavDeff && infDeff) {
        sum += a.count * cavDeff * cavalry + a.count * infDeff * (1 - cavalry);
      }
    });
    return sum;
  }

  animalToString(animals: Animal[]) {
    let result = "";
    animals.forEach((a: Animal) => {
      result +=
        a.count +
        " " +
        this.data.find((v: AnimalData) => v.id == a.id)?.name +
        ", ";
    });
    return result;
  }

  readData() {
    if (this.data.length) return;

    const fileContent = this.httpClient
      .get("assets/AnimalData.csv", { responseType: "text" })
      .subscribe((fileContent) => {
        const arr = fileContent.split(/\r?\n/);

        arr.forEach((line: string) => {
          let splitLine = line.split(",");
          this.data.push({
            id: parseInt(splitLine[0]),
            name: splitLine[1],
            infDeff: parseInt(splitLine[2]),
            cavDeff: parseInt(splitLine[3]),
            res: parseInt(splitLine[4]) * 160,
          });
        });
      });
  }

  parse(tile: Tile): Oasis | null {
    if (tile.did != -1) {
      return null;
    }
    let oasis: Oasis = {
      position: tile.position,
      animals: [],
      type: this.getOasisType(tile),
      resType: this.getResType(tile),
      lastHit: this.getLastHit(tile),
      currentRes: 0,
    };

    oasis.currentRes = this.calculateCurrentRes(oasis);
    if (oasis.currentRes == -1) {
      return null;
    }

    for (let i = 31; i < 41; i++) {
      if (tile.text.includes("u" + i)) {
        let value = tile.text
          .substring(tile.text.indexOf("u" + i) + 3)
          .match("[0-9]{1,3}");
        if (value) {
          oasis.animals.push({ id: i, count: parseInt(value[0]) });
        }
      }
    }

    return oasis;
  }

  private getResType(tile: Tile): Resource {
    if (!tile?.text) throw "tile text doesnt exist";

    // Find {a:r1}, {a:r2}, {a:r3}, {a:r4}
    const regex = /\{a:r([1-4])\}/g;
    const found: number[] = [];
    let m: RegExpExecArray | null;

    while ((m = regex.exec(tile.text)) !== null) {
      found.push(parseInt(m[1], 10));
    }
    if (found.length === 0) throw "oasis not found";

    // Dedupe
    const unique = Array.from(new Set(found));

    // If more than one, it's guaranteed to be [crop, X] per your rule → return X
    if (unique.length > 1) {
      const nonCrop = unique.find((code) => code !== 4);
      return nonCrop ? this.mapResourceCode(nonCrop) : Resource.Crop; // fallback safety
    }

    // Single type
    return this.mapResourceCode(unique[0]);
  }

  private mapResourceCode(code: number): Resource {
    switch (code) {
      case 1:
        return Resource.Wood;
      case 2:
        return Resource.Clay;
      case 3:
        return Resource.Iron;
      case 4:
        return Resource.Crop;
      default:
        return Resource.Crop;
    }
  }

  calculateCurrentRes(oasis: Oasis): number {
    let hoursSinceHit =
      (new Date().getTime() - oasis.lastHit.getTime()) / (1000 * 60 * 60);

    if (hoursSinceHit < this.minDelay && hoursSinceHit > 0) {
      return -1;
    }
    let cap = oasis.type == OasisType.Single ? 1000 : 2000;

    switch (oasis.type) {
      case OasisType.Single50:
        return (
          Math.min(cap, 70 * hoursSinceHit * this.gameSpeed) +
          3 * Math.min(cap, 10 * hoursSinceHit * this.gameSpeed)
        );
      case OasisType.Single:
        return (
          Math.min(cap, 40 * hoursSinceHit * this.gameSpeed) +
          3 * Math.min(cap, 10 * hoursSinceHit * this.gameSpeed)
        );
      case OasisType.Double:
        return (
          2 * Math.min(cap, 40 * hoursSinceHit * this.gameSpeed) +
          2 * Math.min(cap, 10 * hoursSinceHit * this.gameSpeed)
        );
      case OasisType.Occupied:
        return 0;
    }
  }

  getLastHit(tile: Tile): Date {
    // today, 08:20 format
    let dateString = tile.text.match("today, [0-9]{2}:[0-9]{2}");
    var date = new Date();

    if (dateString) {
      // formatDate(dateString[0], 'yyyy-MM-dd:', 'en-UK');
      var timeSplit = dateString[0].split(":");

      let date2 = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        parseInt(timeSplit[0].slice(-2)),
        parseInt(timeSplit[1])
      );

      if (date2 > new Date()) {
        date = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - 1,
          parseInt(timeSplit[0].slice(-2)),
          parseInt(timeSplit[1])
        );
      } else {
        date = date2;
      }
    } else {
      // 14.02.24, 14:58 format
      dateString = tile.text.match(
        "[0-9]{2}.[0-9]{2}.[0-9]{2}, [0-9]{2}:[0-9]{2}"
      );
      if (!dateString) {
        return date;
      }
      var dateSplit = dateString[0].split(".");
      var timeSplit = dateString[0].split(":");

      date = new Date(
        parseInt(dateSplit[2].slice(0, 2)) + 2000,
        parseInt(dateSplit[1]) - 1,
        parseInt(dateSplit[0]),
        parseInt(timeSplit[0].slice(-2)),
        parseInt(timeSplit[1])
      );
    }

    return date;
  }

  getOasisType(tile: Tile): OasisType {
    let occupied = tile.text.includes("spieler");
    if (occupied) return OasisType.Occupied;

    let matchCount = tile.text.split("25%").length - 1;
    switch (matchCount) {
      case 0:
        return OasisType.Single50;
      case 1:
        return OasisType.Single;
      case 2:
        return OasisType.Double;
      default:
        throw new Error("wrong number of regex matches" + tile.text);
    }
  }

  isNew(current: Oasis): boolean {
    if (
      this.oases.filter((old) => {
        return (
          old.position.x == current.position.x &&
          old.position.y == current.position.y
        );
      }).length
    ) {
      return false;
    }

    return true;
  }

  addToTotalAndDelete(
    unitCount: number,
    animalBounty: number,
    resBounty: number,
    losses: number,
    link: string
  ) {
    this.totalClicked += unitCount;
    this.totalAnimals += animalBounty;
    this.totalRaid += resBounty;
    this.totalLoss += losses;
    if (this.deleteOnClick) {
      this.rawData = this.rawData.filter((a) => a.link != link);
      let sort = this.dataSource.sort;
      this.dataSource = new MatTableDataSource(this.rawData);
      this.dataSource.sort = sort;
    }
  }

  getValue($event: Event): string {
    return ($event.target as HTMLInputElement).value;
  }

  getIntValue($event: Event): number {
    return parseInt(($event.target as HTMLInputElement).value);
  }

  getFloatValue($event: Event): number {
    return parseFloat(($event.target as HTMLInputElement).value);
  }

  handleClick($event: any) {
    this.cavalry = $event.checked;
  }

  shareLink(): string {
    let result = window.location.host + "?";
    this.parameterList.forEach((param) => {
      result += `${param}=${this[param as keyof AppComponent]}&`;
    });
    return result;
  }
}
function calculateRemains(animals: Animal[], losses: number): Animal[] {
  var remaining: Animal[] = [];
  animals.forEach((a) => {
    a.count = Math.round(a.count * (1 - losses));
    if (a.count > 0) {
      remaining.push(a);
    }
  });
  return remaining;
}
