// Comprehensive Indian States, Districts, and Cities Data
// Structured for cascading dropdown functionality

export interface District {
  name: string;
  cities: string[];
}

export interface State {
  name: string;
  districts: District[];
}

export const indianStates: State[] = [
  {
    name: 'Andhra Pradesh',
    districts: [
      {
        name: 'Anantapur',
        cities: ['Anantapur', ' Dharmavaram', ' Hindupur', ' Tadpatri', ' Guntakal', ' Gooty', ' Penukonda', ' Kadiri'],
      },
      {
        name: 'Chittoor',
        cities: ['Chittoor', ' Tirupati', ' Madanapalle', ' Palamaner', ' Puttur', ' Srikalahasti', ' Kuppam', ' Piler'],
      },
      {
        name: 'East Godavari',
        cities: ['Kakinada', ' Rajahmundry', ' Eluru', ' Ramachandrapuram', ' Peddapuram', ' Tuni', ' Gollaprolu', ' Prathipadu'],
      },
      {
        name: 'Guntur',
        cities: ['Guntur', ' Tenali', ' Mangalagiri', ' Narasaraopet', ' Chilakaluripet', ' Macherla', ' Vinukonda', ' Duggirala'],
      },
      {
        name: 'Krishna',
        cities: ['Vijayawada', ' Gudivada', ' Machilipatnam', ' Nandivada', ' Vuyyuru', ' Jaggaiahpet', ' Kaikaluru', ' Pedana'],
      },
      {
        name: 'Kurnool',
        cities: ['Kurnool', ' Adoni', ' Nandyal', ' Badvel', ' Atmakur', ' Gadwal', ' Mantralayam', ' Yemmiganur'],
      },
      {
        name: 'Nellore',
        cities: ['Nellore', ' Kavali', ' Gudur', ' Venkatagiri', ' Sullurpeta', ' Kavalur', ' Ojili', ' Kaligiri'],
      },
      {
        name: 'Prakasam',
        cities: ['Ongole', ' Chirala', ' Markapur', ' Kandukur', ' Chimakurthi', ' Donakonda', ' Addanki', ' Maddipadu'],
      },
      {
        name: 'Srikakulam',
        cities: ['Srikakulam', ' Tekkali', ' Palakonda', ' Kalingapatnam', ' Amadalavalasa', ' Hiramandalam', ' Sompeta', ' Veeraghattam'],
      },
      {
        name: 'Visakhapatnam',
        cities: ['Visakhapatnam', ' Anakapalli', ' Bheemunipatnam', ' Narsipatnam', ' Yelamanchili', ' Madhurapudi', ' Sabbavaram', ' Kotauratla'],
      },
      {
        name: 'Vizianagaram',
        cities: ['Vizianagaram', ' Bobbili', ' Salur', ' Parvathipuram', ' Rampachodavaram', ' Cheepurupalli', ' Nellimarla', ' Kothavalasa'],
      },
      {
        name: 'West Godavari',
        cities: ['Eluru', ' Bhimavaram', ' Kovvur', ' Nidadavole', ' Tadepalligudem', ' Palakol', ' Tanuku', ' Narasapuram'],
      },
    ],
  },
  {
    name: 'Arunachal Pradesh',
    districts: [
      {
        name: 'Anjaw',
        cities: ['Hawai', ' Hayuliang', ' Walong', ' Kibithu', ' Kawai', ' Chalkot'],
      },
      {
        name: 'Changlang',
        cities: ['Changlang', ' Bordumsa', ' Miao', ' Kharsang', ' Diyun', ' Jengging'],
      },
      {
        name: 'Dibang Valley',
        cities: ['Anini', ' Etalin', ' Hunli'],
      },
      {
        name: 'East Kameng',
        cities: ['Seppa', ' Pakke-Kesang', ' Pader', ' Lada', ' Bameng'],
      },
      {
        name: 'East Siang',
        cities: ['Pasighat', ' Ruksin', ' Geku', ' Namsang', ' Mirku', ' Koyu'],
      },
      {
        name: 'Itanagar Capital Complex',
        cities: ['Itanagar', ' Naharlagun', ' Banderdewa', ' Doimukh', ' Gumto'],
      },
      {
        name: 'Kra-Daadi',
        cities: ['Daporijo', ' Limeking', ' Tali'],
      },
      {
        name: 'Kurung Kumey',
        cities: ['Koloriang', ' Puchi Geko', ' Sarli'],
      },
      {
        name: 'Lepa Rada',
        cities: ['Basar', ' Dabi', ' Tirbin'],
      },
      {
        name: 'Lohit',
        cities: ['Tezu', ' Sunpura', ' Wakro'],
      },
      {
        name: 'Longding',
        cities: ['Longding', ' Kanubari', ' Pumao'],
      },
      {
        name: 'Lower Dibang Valley',
        cities: ['Roing', ' Inanli', ' Hunli'],
      },
      {
        name: 'Lower Siang',
        cities: ['Yingkiong', ' Jengging', ' Gige'],
      },
      {
        name: 'Lower Subansiri',
        cities: ['Ziro', ' Yachuli', ' Old Ziro'],
      },
      {
        name: 'Namsai',
        cities: ['Namsai', ' Chongkham', ' Lakhimpur'],
      },
      {
        name: 'Pakke-Kesang',
        cities: ['Seijosa', ' Pakke-Kesang', ' Bhalukpong'],
      },
      {
        name: 'Papum Pare',
        cities: ['Itanagar', ' Naharlagun', ' Sagalee'],
      },
      {
        name: 'Siang',
        cities: ['Aalo', ' Kugging', ' Regi'],
      },
      {
        name: 'Tawang',
        cities: ['Tawang', ' Lumla', ' Jang'],
      },
      {
        name: 'Tirap',
        cities: ['Khonsa', ' Longding', ' Kanubari'],
      },
      {
        name: 'Upper Siang',
        cities: ['Yingkiong', ' Jengging', ' Gige'],
      },
      {
        name: 'Upper Subansiri',
        cities: [' Daporijo', ' Pugo', ' Limeking'],
      },
      {
        name: 'West Kameng',
        cities: ['Bomdila', ' Dirang', ' Rupa'],
      },
      {
        name: 'West Siang',
        cities: ['Aalo', ' Along', ' Kaying'],
      },
    ],
  },
  {
    name: 'Assam',
    districts: [
      {
        name: 'Baksa',
        cities: ['Mushalpur', ' Tamulpur', ' Bagrabari'],
      },
      {
        name: 'Barpeta',
        cities: ['Barpeta', ' Howly', 'Pathsala'],
      },
      {
        name: 'Biswanath',
        cities: ['Biswanath Chariali', ' Haflong', ' Diphupar'],
      },
      {
        name: 'Bongaigaon',
        cities: ['Bongaigaon', ' Abhayapuri', ' Dangtol'],
      },
      {
        name: 'Cachar',
        cities: ['Silchar', ' Lakhipur', ' Sonai'],
      },
      {
        name: 'Charaideo',
        cities: ['Sonari', ' Sonai', ' Simaluguri'],
      },
      {
        name: 'Chirang',
        cities: ['Kokrajhar', ' Sidli', ' Gossaigaon'],
      },
      {
        name: 'Darrang',
        cities: ['Mangaldoi', ' Dalgaon', ' Sipajhar'],
      },
      {
        name: 'Dhemaji',
        cities: ['Dhemaji', ' Sissibargaon', ' Jonai'],
      },
      {
        name: 'Dhubri',
        cities: ['Dhubri', ' Goalpara', ' Mankachar'],
      },
      {
        name: 'Dibrugarh',
        cities: ['Dibrugarh', ' Moran', ' Tinsukia'],
      },
      {
        name: 'Dima Hasao',
        cities: ['Haflong', ' Haflong', ' Umrangso'],
      },
      {
        name: 'Goalpara',
        cities: ['Goalpara', ' Dudhnoi', ' Lakhipur'],
      },
      {
        name: 'Golaghat',
        cities: ['Golaghat', ' Bokakhat', ' Kaziranga'],
      },
      {
        name: 'Hailakandi',
        cities: ['Hailakandi', ' Lala', ' Katlicherra'],
      },
      {
        name: 'Hojai',
        cities: ['Hojai', ' Dobaka', ' Lanka'],
      },
      {
        name: 'Jorhat',
        cities: ['Jorhat', ' Titabor', ' Mariani'],
      },
      {
        name: 'Kamrup',
        cities: ['Guwahati', ' Rangia', ' Hajo'],
      },
      {
        name: 'Kamrup Metropolitan',
        cities: ['Guwahati', ' Dispur', ' Sonapur'],
      },
      {
        name: 'Karbi Anglong',
        cities: ['Diphu', ' Bokajan', ' Hamren'],
      },
      {
        name: 'Karimganj',
        cities: ['Karimganj', ' Badarpur', ' Nilambazar'],
      },
      {
        name: 'Kokrajhar',
        cities: ['Kokrajhar', ' Gossaigaon', ' Sidli'],
      },
      {
        name: 'Lakhimpur',
        cities: ['North Lakhimpur', ' Dhakuakhana', ' Subansiri'],
      },
      {
        name: 'Majuli',
        cities: ['Jorhat', ' Majuli', ' Garamur'],
      },
      {
        name: 'Morigaon',
        cities: ['Morigaon', ' Jagiroad', ' Bhuragaon'],
      },
      {
        name: 'Nagaon',
        cities: ['Nagaon', ' Hojai', ' Kampur'],
      },
      {
        name: 'Nalbari',
        cities: ['Nalbari', ' Belsur', ' Ghograpar'],
      },
      {
        name: 'Sivasagar',
        cities: ['Sivasagar', ' Nazira', ' Amguri'],
      },
      {
        name: 'Sonitpur',
        cities: ['Tezpur', ' Dhekiajuli', ' Rangapara'],
      },
      {
        name: 'South Salmara-Mankachar',
        cities: ['Mankachar', ' Dhubri', ' South Salmara'],
      },
      {
        name: 'Tinsukia',
        cities: ['Tinsukia', ' Dibrugarh', ' Margherita'],
      },
      {
        name: 'Udalguri',
        cities: ['Udalguri', ' Kalaigaon', ' Rowta'],
      },
      {
        name: 'West Karbi Anglong',
        cities: ['Hamren', ' Baithalangso', ' Dokmoka'],
      },
    ],
  },
  {
    name: 'Bihar',
    districts: [
      {
        name: 'Araria',
        cities: ['Araria', ' Forbesganj', ' Jogbani'],
      },
      {
        name: 'Arwal',
        cities: ['Arwal', ' Kurtha', ' Kaler'],
      },
      {
        name: 'Aurangabad',
        cities: ['Aurangabad', ' Daudnagar', ' Rafiganj'],
      },
      {
        name: 'Banka',
        cities: ['Banka', ' Amarpur', ' Belhar'],
      },
      {
        name: 'Begusarai',
        cities: ['Begusarai', ' Khagaria', ' Bakhri'],
      },
      {
        name: 'Bhagalpur',
        cities: ['Bhagalpur', ' Kahalgaon', ' Sultanganj'],
      },
      {
        name: 'Bhojpur',
        cities: ['Arah', ' Jagdishpur', ' Shahpur'],
      },
      {
        name: 'Buxar',
        cities: ['Buxar', ' Ramgarh', ' Chausa'],
      },
      {
        name: 'Darbhanga',
        cities: ['Darbhanga', ' Benipatti', ' Biraul'],
      },
      {
        name: 'East Champaran',
        cities: ['Motihari', ' Ghorasahan', ' Madhuban'],
      },
      {
        name: 'Gaya',
        cities: ['Gaya', ' Tikari', ' Sherghati'],
      },
      {
        name: 'Gopalganj',
        cities: ['Gopalganj', ' Kuchaikote', ' Bhorey'],
      },
      {
        name: 'Jamui',
        cities: ['Jamui', ' Jehanabad', ' Lakshmipur'],
      },
      {
        name: 'Jehanabad',
        cities: ['Jehanabad', ' Kako', ' Modanganj'],
      },
      {
        name: 'Kaimur',
        cities: ['Bhabua', ' Ramgarh', ' Bhagwanpur'],
      },
      {
        name: 'Katihar',
        cities: ['Katihar', ' Barsoi', ' Manihari'],
      },
      {
        name: 'Khagaria',
        cities: ['Khagaria', ' Gogri', ' Beldaur'],
      },
      {
        name: 'Kishanganj',
        cities: ['Kishanganj', ' Thakurganj', ' Kochadhamin'],
      },
      {
        name: 'Lakhisarai',
        cities: ['Lakhisarai', ' Surajgarha', ' Pipariya'],
      },
      {
        name: 'Madhepura',
        cities: ['Madhepura', ' Ghailadham', ' Kumarpur'],
      },
      {
        name: 'Madhubani',
        cities: ['Madhubani', ' Benipatti', ' Jainagar'],
      },
      {
        name: 'Munger',
        cities: ['Munger', ' Tarapur', ' Bariarpur'],
      },
      {
        name: 'Muzaffarpur',
        cities: ['Muzaffarpur', ' Kanti', ' Minapur'],
      },
      {
        name: 'Nalanda',
        cities: ['Bihar Sharif', ' Rajgir', ' Nalanda'],
      },
      {
        name: 'Nawada',
        cities: ['Nawada', ' Rajauli', ' Warisaliganj'],
      },
      {
        name: 'Patna',
        cities: ['Patna', ' Danapur', ' Paliganj'],
      },
      {
        name: 'Purnia',
        cities: ['Purnia', ' Baisi', ' Banmankhi'],
      },
      {
        name: 'Rohtas',
        cities: ['Sasaram', ' Dehri', ' Bikramganj'],
      },
      {
        name: 'Saharsa',
        cities: ['Saharsa', ' Kahara', ' Satar'],
      },
      {
        name: 'Samastipur',
        cities: ['Samastipur', ' Dalsinghsarai', ' Tajpur'],
      },
      {
        name: 'Saran',
        cities: ['Chapra', ' Marhaura', ' Dariyapur'],
      },
      {
        name: 'Sheikhpura',
        cities: ['Sheikhpura', ' Ariari', ' Chewara'],
      },
      {
        name: 'Sheohar',
        cities: ['Sheohar', ' Piprahi', ' Dumri'],
      },
      {
        name: 'Sitamarhi',
        cities: ['Sitamarhi', ' Bairagnia', ' Pupri'],
      },
      {
        name: 'Siwan',
        cities: ['Siwan', ' Mairwa', ' Goriakothi'],
      },
      {
        name: 'Supaul',
        cities: ['Supaul', ' Triveniganj', ' Pipra'],
      },
      {
        name: 'Vaishali',
        cities: ['Hajipur', ' Lalganj', ' Raghopur'],
      },
      {
        name: 'West Champaran',
        cities: ['Bagaha', ' Narkatiaganj', ' Gaunaha'],
      },
    ],
  },
  {
    name: 'Chhattisgarh',
    districts: [
      {
        name: 'Balod',
        cities: ['Balod', ' Dondi', ' Dondi Lohara'],
      },
      {
        name: 'Baloda Bazar',
        cities: ['Baloda Bazar', ' Bhatapara', ' Kasdol'],
      },
      {
        name: 'Balrampur',
        cities: ['Balrampur', ' Shankargarh', ' Rajpur'],
      },
      {
        name: 'Bastar',
        cities: ['Jagdalpur', ' Tokapal', ' Bakawand'],
      },
      {
        name: 'Bemetara',
        cities: ['Bemetara', ' Saja', ' Bharda'],
      },
      {
        name: 'Bilaspur',
        cities: ['Bilaspur', ' Takhatpur', ' Masturi'],
      },
      {
        name: 'Dantewada',
        cities: ['Dantewada', ' Bhopalpattnam', ' Chhindgarh'],
      },
      {
        name: 'Dhamtari',
        cities: ['Dhamtari', ' Kurud', ' Magarlod'],
      },
      {
        name: 'Durg',
        cities: ['Durg', ' Patan', ' Dhamtari'],
      },
      {
        name: 'Gariaband',
        cities: ['Gariaband', ' Bindrawani', ' Chhura'],
      },
      {
        name: 'Gaurela Pendra Marwahi',
        cities: ['Pendra', ' Marwahi', ' Gaurela'],
      },
      {
        name: 'Janjgir-Champa',
        cities: ['Janjgir', ' Sakti', ' Malkharoda'],
      },
      {
        name: 'Jashpur',
        cities: ['Jashpur Nagar', ' Kunkuri', ' Jashpur'],
      },
      {
        name: 'Kabirdham',
        cities: ['Kabirdham', ' Pandariya', ' Bodla'],
      },
      {
        name: 'Kanker',
        cities: ['Kanker', ' Charama', ' Keskal'],
      },
      {
        name: 'Kondagaon',
        cities: ['Kondagaon', ' Bakawand', ' Kondagaon'],
      },
      {
        name: 'Korba',
        cities: ['Korba', ' Pali', ' Katghora'],
      },
      {
        name: 'Korea',
        cities: ['Korea', ' Baikunthpur', ' Sonhat'],
      },
      {
        name: 'Mahasamund',
        cities: ['Mahasamund', ' Bagbahra', ' Pachhra'],
      },
      {
        name: 'Mungeli',
        cities: ['Mungeli', ' Lormi', ' Patharia'],
      },
      {
        name: 'Narayanpur',
        cities: ['Narayanpur', ' Orchha', ' Bhainsa'],
      },
      {
        name: 'Raigarh',
        cities: ['Raigarh', ' Kharsia', ' Tamnar'],
      },
      {
        name: 'Raipur',
        cities: ['Raipur', ' Abhanpur', ' Arang'],
      },
      {
        name: 'Rajnandgaon',
        cities: ['Rajnandgaon', ' Dongargaon', ' Manpur'],
      },
      {
        name: 'Sukma',
        cities: ['Sukma', ' Konta', ' Chhindgarh'],
      },
      {
        name: 'Surajpur',
        cities: ['Surajpur', ' Bishrampur', ' Premnagar'],
      },
    ],
  },
  {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    districts: [
      {
        name: 'Dadra and Nagar Haveli',
        cities: ['Silvassa', ' Dadra', ' Naroli'],
      },
      {
        name: 'Daman',
        cities: ['Daman', ' Moti Daman', ' Nani Daman'],
      },
      {
        name: 'Diu',
        cities: ['Diu', ' Ghoghla', ' Vanakbara'],
      },
    ],
  },
  {
    name: 'Delhi',
    districts: [
      {
        name: 'Central Delhi',
        cities: ['New Delhi', ' Daryaganj', ' Pahar Ganj'],
      },
      {
        name: 'East Delhi',
        cities: ['Preet Vihar', ' Laxmi Nagar', ' Shahdara'],
      },
      {
        name: 'New Delhi',
        cities: ['Connaught Place', ' Chanakyapuri', ' Janpath'],
      },
      {
        name: 'North Delhi',
        cities: ['Model Town', ' Rohini', ' Pitampura'],
      },
      {
        name: 'North East Delhi',
        cities: ['Shahdara', ' Seemapuri', ' Dilshad Garden'],
      },
      {
        name: 'North West Delhi',
        cities: ['Rohini', ' Pitampura', ' Saraswati Vihar'],
      },
      {
        name: 'Shahdara',
        cities: ['Shahdara', ' Seemapuri', ' Babarpur'],
      },
      {
        name: 'South Delhi',
        cities: ['Kalkaji', ' Saket', ' Greater Kailash'],
      },
      {
        name: 'South East Delhi',
        cities: ['Nehru Place', ' Lajpat Nagar', ' Govindpuri'],
      },
      {
        name: 'South West Delhi',
        cities: ['Dwarka', ' Janakpuri', ' Vikaspuri'],
      },
      {
        name: 'West Delhi',
        cities: ['Rajouri Garden', ' Paschim Vihar', ' Uttam Nagar'],
      },
    ],
  },
  {
    name: 'Goa',
    districts: [
      {
        name: 'North Goa',
        cities: ['Panaji', ' Mapusa', ' Pernem', ' Bicholim', ' Satari', ' Bardez'],
      },
      {
        name: 'South Goa',
        cities: ['Margao', ' Mormugao', ' Canacona', ' Quepem', ' Salcete', ' Daman'],
      },
    ],
  },
  {
    name: 'Gujarat',
    districts: [
      {
        name: 'Ahmedabad',
        cities: ['Ahmedabad', ' Sanand', ' Bavla', ' Dholka', ' Dhandhuka'],
      },
      {
        name: 'Amreli',
        cities: ['Amreli', ' Babra', ' Khambha', ' Lathi', ' Savarkundla'],
      },
      {
        name: 'Anand',
        cities: ['Anand', ' Umreth', ' Petlad', ' Sojitra', ' Borsad'],
      },
      {
        name: 'Aravalli',
        cities: ['Modasa', ' Himmatnagar', ' Dhansura', ' Malpur', ' Bayad'],
      },
      {
        name: 'Banaskantha',
        cities: ['Palanpur', ' Deesa', ' Tharad', ' Dantiwada', ' Vadgam'],
      },
      {
        name: 'Bharuch',
        cities: ['Bharuch', ' Ankleshwar', ' Vagra', ' Jhagadia', ' Valia'],
      },
      {
        name: 'Bhavnagar',
        cities: ['Bhavnagar', ' Gariadhar', ' Palitana', ' Talaja', ' Ghogha'],
      },
      {
        name: 'Botad',
        cities: ['Botad', ' Gadhada', ' Ranpur', ' Vallabhipur'],
      },
      {
        name: 'Chhota Udepur',
        cities: ['Chhota Udepur', ' Jetpur Pavi', ' Nasvadi', ' Kawant'],
      },
      {
        name: 'Dahod',
        cities: ['Dahod', ' Zalod', ' Devgadh Baria', ' Fatepura', ' Limkheda'],
      },
      {
        name: 'Dang',
        cities: ['Ahwa', ' Waghai', ' Subir'],
      },
      {
        name: 'Devbhoomi Dwarka',
        cities: ['Dwarka', ' Khambhaliya', ' Bhanvad', ' Okha', ' Kalyanpur'],
      },
      {
        name: 'Gandhinagar',
        cities: ['Gandhinagar', ' Kalol', ' Dehgam', ' Mansa', ' Chiloda'],
      },
      {
        name: 'Gir Somnath',
        cities: ['Veraval', ' Sutrapada', ' Talala', ' Kodinar', ' Una'],
      },
      {
        name: 'Jamnagar',
        cities: ['Jamnagar', ' Jamnagar', ' Dwarka', ' Kalavad', ' Khambhaliya'],
      },
      {
        name: 'Junagadh',
        cities: ['Junagadh', ' Una', ' Mangrol', ' Mendarda', ' Malia'],
      },
      {
        name: 'Kheda',
        cities: ['Nadiad', ' Kapadvanj', ' Thasra', ' Kathlal', ' Mehmdabad'],
      },
      {
        name: 'Kutch',
        cities: ['Bhuj', ' Anjar', ' Mundra', ' Nakhatrana', ' Lakhpat'],
      },
      {
        name: 'Mahisagar',
        cities: ['Lunawada', ' Kadana', ' Santrampur', ' Khanpur', ' Virpur'],
      },
      {
        name: 'Mehsana',
        cities: ['Mehsana', ' Unjha', ' Visnagar', ' Becharaji', ' Kadi'],
      },
      {
        name: 'Morbi',
        cities: ['Morbi', ' Wankaner', ' Maliya', ' Halvad', ' Tankara'],
      },
      {
        name: 'Narmada',
        cities: ['Rajpipla', ' Nandod', ' Dediyapada', ' Garudeshwar', ' Tilakwada'],
      },
      {
        name: 'Navsari',
        cities: ['Navsari', ' Valsad', ' Chikhli', ' Gandevi', ' Jalalpore'],
      },
      {
        name: 'Panchmahals',
        cities: ['Godhra', ' Dahod', ' Kalol', ' Shehera', ' Morwa'],
      },
      {
        name: 'Patan',
        cities: ['Patan', ' Radhanpur', ' Sami', ' Chanasma', ' Hirpura'],
      },
      {
        name: 'Porbandar',
        cities: ['Porbandar', ' Ranavav', ' Kutiyana'],
      },
      {
        name: 'Rajkot',
        cities: ['Rajkot', ' Jetpur', ' Gondal', ' Upleta', ' Dhoraji'],
      },
      {
        name: 'Sabarkantha',
        cities: ['Himatnagar', ' Prantij', ' Khedbrahma', ' Talod', ' Vadali'],
      },
      {
        name: 'Surat',
        cities: ['Surat', ' Bardoli', ' Olpad', ' Kamrej', ' Palsana'],
      },
      {
        name: 'Surendranagar',
        cities: ['Surendranagar', ' Wadhwan', ' Dhrangadhra', ' Chotila', ' Sayla'],
      },
      {
        name: 'Tapi',
        cities: ['Valsad', ' Vapi', ' Pardi', ' Kaprada', ' Umbergaon'],
      },
      {
        name: 'Vadodara',
        cities: ['Vadodara', ' Savli', ' Sinor', ' Dabhoi', ' Karjan'],
      },
      {
        name: 'Valsad',
        cities: ['Valsad', ' Vapi', ' Pardi', ' Kaprada', ' Umbergaon'],
      },
    ],
  },
  {
    name: 'Haryana',
    districts: [
      {
        name: 'Ambala',
        cities: ['Ambala', ' Naraingarh', ' Barara', ' Mullana'],
      },
      {
        name: 'Bhiwani',
        cities: ['Bhiwani', ' Loharu', ' Bawani Khera', ' Tosham', ' Siwani'],
      },
      {
        name: 'Charkhi Dadri',
        cities: ['Charkhi Dadri', ' Badhra', ' Bond Kalan'],
      },
      {
        name: 'Faridabad',
        cities: ['Faridabad', ' Ballabhgarh', ' Adampur'],
      },
      {
        name: 'Gurugram',
        cities: ['Gurugram', ' Sohna', ' Manesar'],
      },
      {
        name: 'Hisar',
        cities: ['Hisar', ' Adampur', ' Barwala', ' Agroha', ' Uklana'],
      },
      {
        name: 'Jhajjar',
        cities: ['Jhajjar', ' Beri', ' Bahadurgarh', ' Badli', ' Salhawas'],
      },
      {
        name: 'Jind',
        cities: ['Jind', ' Julana', ' Safidon', ' Narwana', ' Uchana'],
      },
      {
        name: 'Kaithal',
        cities: ['Kaithal', ' Guhla', ' Kalayat', ' Pundri', ' Rajound'],
      },
      {
        name: 'Karnal',
        cities: ['Karnal', ' Nilokheri', ' Indri', ' Assandh', ' Taraori'],
      },
      {
        name: 'Kurukshetra',
        cities: ['Kurukshetra', ' Shahbad', ' Thanesar', ' Ladwa', ' Pehowa'],
      },
      {
        name: 'Mahendragarh',
        cities: ['Mahendragarh', ' Narnaul', ' Kanina', ' Nizat'],
      },
      {
        name: 'Mewat',
        cities: ['Nuh', ' Punahana', ' Ferozepur Jhirka', ' Taoru', ' Nagina'],
      },
      {
        name: 'Palwal',
        cities: ['Palwal', ' Hodal', ' Hassanpur', ' Aurangabad', ' Hathin'],
      },
      {
        name: 'Panchkula',
        cities: ['Panchkula', ' Morni', ' Raipur Rani'],
      },
      {
        name: 'Panipat',
        cities: ['Panipat', ' Israna', ' Madlauda', ' Sanauli Khurd'],
      },
      {
        name: 'Rewari',
        cities: ['Rewari', ' Bawal', ' Kosli', ' Nahar', ' Jatusana'],
      },
      {
        name: 'Rohtak',
        cities: ['Rohtak', ' Kalanaur', ' Meham', ' Gohana', ' Sampla'],
      },
      {
        name: 'Sirsa',
        cities: ['Sirsa', ' Ellenabad', ' Nathusari Chopta', ' Rania', ' Odhan'],
      },
      {
        name: 'Sonipat',
        cities: ['Sonipat', ' Ganaur', ' Gohana', ' Kathura', ' Rai'],
      },
      {
        name: 'Yamunanagar',
        cities: ['Yamunanagar', ' Jagadhri', ' Radaur', ' Chhachhrauli', ' Bilaspur'],
      },
    ],
  },
  {
    name: 'Himachal Pradesh',
    districts: [
      {
        name: 'Bilaspur',
        cities: ['Bilaspur', ' Ghumarwin', ' Jhanduta', ' Naina Devi'],
      },
      {
        name: 'Chamba',
        cities: ['Chamba', ' Dalhousie', ' Bharmour', ' Pangi', ' Salooni'],
      },
      {
        name: 'Hamirpur',
        cities: ['Hamirpur', ' Sujanpur', ' Nadaun', ' Bhoranj', ' Tira Sujanpur'],
      },
      {
        name: 'Kangra',
        cities: ['Dharamshala', ' Palampur', ' Nurpur', ' Baijnath', ' Jaisinghpur'],
      },
      {
        name: 'Kinnaur',
        cities: ['Rekong Peo', ' Kalpa', ' Nichar', ' Pooh', ' Sangla'],
      },
      {
        name: 'Kullu',
        cities: ['Kullu', ' Manali', ' Naggar', ' Kothi', ' Nirmand'],
      },
      {
        name: 'Lahaul and Spiti',
        cities: ['Keylong', ' Kaza', ' Lahaul', ' Spiti', ' Udaipur'],
      },
      {
        name: 'Mandi',
        cities: ['Mandi', ' Sundernagar', ' Nerchowk', ' Sarkaghat', ' Jogindernagar'],
      },
      {
        name: 'Shimla',
        cities: ['Shimla', ' Theog', ' Chaupal', ' Narkanda', ' Kotkhai'],
      },
      {
        name: 'Sirmaur',
        cities: ['Nahan', ' Paonta Sahib', ' Dhaula Kuan', ' Rajgarh', ' Nohra'],
      },
      {
        name: 'Solan',
        cities: ['Solan', ' Kasauli', ' Kandaghat', ' Nalagarh', ' Arki'],
      },
      {
        name: 'Una',
        cities: ['Una', ' Bangana', ' Haroli', ' Amb', ' Tahli'],
      },
    ],
  },
  {
    name: 'Jammu & Kashmir',
    districts: [
      {
        name: 'Anantnag',
        cities: ['Anantnag', ' Bijbehara', ' Kokernag', ' Doda', ' Kishtwar', ' Pahalgam', ' Akingam', ' Achabal'],
      },
      {
        name: 'Bandipora',
        cities: ['Bandipora', ' Hajin', ' Gurez', ' Tulail', ' Chewa', ' Arin', ' Kunan', ' Naidkhai'],
      },
      {
        name: 'Baramulla',
        cities: ['Baramulla', ' Sopore', ' Uri', ' Pattan', ' Rafiabad', ' Kreeri', ' Panzalla', ' Kandi'],
      },
      {
        name: 'Budgam',
        cities: ['Budgam', ' Beerwah', ' Chadoora', ' Khansahib', ' Khag', ' BK Pora', ' Nagam', ' Chattergam'],
      },
      {
        name: 'Doda',
        cities: ['Doda', ' Bhaderwah', ' Thathri', ' Gandoh', ' Assar', ' Chilli Pingal', ' Bhagwa', ' Bhalessa'],
      },
      {
        name: 'Ganderbal',
        cities: ['Ganderbal', ' Lar', ' Wakura', ' Kangan', ' Haran', ' Gund', ' Wular', ' Safapora'],
      },
      {
        name: 'Jammu',
        cities: ['Jammu', ' Jammu Cantonment', ' R S Pura', ' Bhalwal', ' Marh', ' Satwari', ' Akhnoor', ' Khour'],
      },
      {
        name: 'Kathua',
        cities: ['Kathua', ' Hiranagar', ' Billawar', ' Basohli', ' Duggan', ' Manda', ' Nagri', ' Loughi'],
      },
      {
        name: 'Kishtwar',
        cities: ['Kishtwar', ' Paddar', ' Doda', ' Nagseni', ' Inderwal', ' Chhatroo', ' Bounjwah', ' Dachhan'],
      },
      {
        name: 'Kulgam',
        cities: ['Kulgam', ' Kheer Bhawani', ' Doda', ' Ashmuji', ' Redwani', ' Qazigund', ' Yaripora', ' Gudder'],
      },
      {
        name: 'Kupwara',
        cities: ['Kupwara', ' Handwara', ' Trehgam', ' Langate', ' Sogam', ' Mawer', ' Kralpora', ' Drug Mulla'],
      },
      {
        name: 'Pulwama',
        cities: ['Pulwama', ' Awantipora', ' Tral', ' Pampore', ' Rajpora', ' Kakapora', ' Chandgam', ' Litter'],
      },
      {
        name: 'Poonch',
        cities: ['Poonch', ' Surankote', ' Mankote', ' Mendhar', ' Bafliaz', ' Balakote', ' Chandimarh', ' Koteranka'],
      },
      {
        name: 'Rajouri',
        cities: ['Rajouri', ' Thanamandi', ' Nowshera', ' Kalakote', ' Sunderbani', ' Darhal', ' Budhal', ' Koteranka'],
      },
      {
        name: 'Ramban',
        cities: ['Ramban', ' Batote', ' Banihal', ' Kanthan', ' Dharam', ' pogal Paristan', ' Chanderkote', ' Kundi'],
      },
      {
        name: 'Reasi',
        cities: ['Reasi', ' Katra', ' Reham', '江北', ' Pouni', ' Arnas', ' Thakrakote', ' Bamagh'],
      },
      {
        name: 'Samba',
        cities: ['Samba', ' Bari Brahmna', ' Ramgarh', ' Purmandal', ' Vijaypur', ' G sangwal', ' Kartholi', ' Chak Salarian'],
      },
      {
        name: 'Shopian',
        cities: ['Shopian', ' Keller', ' Arshi Pora', ' Heffron', ' Sedow', ' Kanjiull', ' Memandar', ' Amshipora'],
      },
      {
        name: 'Srinagar',
        cities: ['Srinagar', ' Shahr-e-Khas', ' Lal Bazar', ' Rajbagh', ' Sonwar', ' Badami Bagh', ' Jawahar Nagar', ' Khanyari'],
      },
      {
        name: 'Udhampur',
        cities: ['Udhampur', ' Chenani', ' Ramnagar', ' Panchari', ' Mastgarh', '江北', ' Kartholi', '江北'],
      },
    ],
  },
  {
    name: 'Jharkhand',
    districts: [
      {
        name: 'Bokaro',
        cities: ['Bokaro Steel City', ' Chandrapura', ' Chas', ' Gumia', ' Peterwar'],
      },
      {
        name: 'Chatra',
        cities: ['Chatra', ' Latehar', ' Pratappur', ' Simaria', ' Tasadon'],
      },
      {
        name: 'Deoghar',
        cities: ['Deoghar', ' Madhupur', ' Mohanpur', ' Sarwan', ' Sarath'],
      },
      {
        name: 'Dhanbad',
        cities: ['Dhanbad', ' Jharia', ' Tundi', ' Govindpur', ' Baghmara'],
      },
      {
        name: 'Dumka',
        cities: ['Dumka', ' Jamtara', ' Nala', ' Ramgarh', ' Sikaripara'],
      },
      {
        name: 'East Singhbhum',
        cities: ['Jamshedpur', ' Ghatshila', ' Musabani', ' Jugsalai', ' Patamda'],
      },
      {
        name: 'Garhwa',
        cities: ['Garhwa', ' Nagaruntari', ' Ramna', ' Meral', ' Bhandaria'],
      },
      {
        name: 'Giridih',
        cities: ['Giridih', ' Dhanwar', ' Bagodar', ' Gandey', ' Tisri'],
      },
      {
        name: 'Godda',
        cities: ['Godda', ' Mahgama', ' Pathargama', ' Poraiyahat', ' Sunderpahari'],
      },
      {
        name: 'Gumla',
        cities: ['Gumla', ' Basia', ' Raidih', ' Simdega', ' Chainpur'],
      },
      {
        name: 'Hazaribagh',
        cities: ['Hazaribagh', ' Keredari', ' Katkamsandi', ' Bishnugarh', ' Churchu'],
      },
      {
        name: 'Jamtara',
        cities: ['Jamtara', ' Narayanpur', ' Fatehpur', ' Kundahit', ' Karmatanr'],
      },
      {
        name: 'Khunti',
        cities: ['Khunti', ' Torpa', ' Rania', ' Murhu', ' Erki Tamra'],
      },
      {
        name: 'Koderma',
        cities: ['Koderma', ' Kodarma', ' Jainagar', ' Markacho', ' Satgawan'],
      },
      {
        name: 'Latehar',
        cities: ['Latehar', ' Balumath', ' Barwadih', ' Manika', ' Herhanj'],
      },
      {
        name: 'Lohardaga',
        cities: ['Lohardaga', ' Kuru', ' Bhandra', ' Senha', ' Kisko'],
      },
      {
        name: 'Pakur',
        cities: ['Pakur', ' Amrapara', ' Hiranpur', ' Litipara', ' Maheshpur'],
      },
      {
        name: 'Palamu',
        cities: ['Daltonganj', ' Palamu', ' Hussainabad', ' Lesliganj', ' Medininagar'],
      },
      {
        name: 'Ramgarh',
        cities: ['Ramgarh', ' Mandu', ' Gola', ' Chitarpur', ' Dulmi'],
      },
      {
        name: 'Ranchi',
        cities: ['Ranchi', ' Bundu', ' Angara', ' Kanke', ' Rahe'],
      },
      {
        name: 'Sahibganj',
        cities: ['Sahibganj', ' Sahibganj', ' Rajmahal', ' Borio', ' Mandro'],
      },
      {
        name: 'Seraikela Kharsawan',
        cities: ['Seraikela', ' Adityapur', ' Kandra', ' Chandil', ' Gobindpur'],
      },
      {
        name: 'Simdega',
        cities: ['Simdega', ' Thetaitangar', ' Bano', ' Jaldega', ' Kersai'],
      },
      {
        name: 'West Singhbhum',
        cities: ['Chaibasa', ' Chakradharpur', ' Sonua', ' Manoharpur', ' Tonto'],
      },
    ],
  },
  {
    name: 'Karnataka',
    districts: [
      {
        name: 'Bagalkot',
        cities: ['Bagalkot', ' Badami', ' Hunagund', ' Bilagi', ' Guledgud'],
      },
      {
        name: 'Bangalore Rural',
        cities: ['Anekal', ' Bangalore Rural', ' Devanahalli', ' Doddaballapur', ' Hoskote'],
      },
      {
        name: 'Bangalore Urban',
        cities: ['Bangalore', ' Whitefield', ' Electronic City', ' Yelahanka', ' KR Puram'],
      },
      {
        name: 'Belgaum',
        cities: ['Belgaum', ' Khanapur', ' Athni', ' Hukkeri', ' Raibag'],
      },
      {
        name: 'Bellary',
        cities: ['Bellary', ' Hospet', ' Kampli', ' Sandur', ' Siruguppa'],
      },
      {
        name: 'Bidar',
        cities: ['Bidar', ' Basavakalyan', ' Bhalki', ' Humnabad', ' Aurad'],
      },
      {
        name: 'Chikkaballapur',
        cities: ['Chikkaballapur', ' Gauribidanur', ' Chikkamagaluru', ' Kolar', ' Kolar Gold Fields'],
      },
      {
        name: 'Chikkamagaluru',
        cities: ['Chikkamagaluru', ' Sringeri', ' Mudigere', ' Koppa', ' Narasimharajapura'],
      },
      {
        name: 'Chitradurga',
        cities: ['Chitradurga', ' Challakere', ' Hiriyur', ' Holalkere', ' Hosdurga'],
      },
      {
        name: 'Dakshina Kannada',
        cities: ['Mangalore', ' Udupi', ' Puttur', ' Belthangady', ' Sullia'],
      },
      {
        name: 'Davanagere',
        cities: ['Davanagere', ' Harihar', ' Honnali', ' Jagalur', ' Nyamathi'],
      },
      {
        name: 'Dharwad',
        cities: ['Dharwad', ' Hubli', ' Kalghatgi', ' Navalgund', ' Kundgol'],
      },
      {
        name: 'Gadag',
        cities: ['Gadag', ' Gajendragad', ' Mundaragi', ' Naragund', ' Ron'],
      },
      {
        name: 'Gulbarga',
        cities: ['Gulbarga', ' Aland', ' Chincholi', ' Jevargi', ' Sedam'],
      },
      {
        name: 'Hassan',
        cities: ['Hassan', ' Alur', ' Arkalgud', ' Arsikere', ' Belur'],
      },
      {
        name: 'Haveri',
        cities: ['Haveri', ' Byadagi', ' Hangal', ' Hirekerur', ' Ranebennur'],
      },
      {
        name: 'Kalaburagi',
        cities: ['Kalaburagi', ' Afzalpur', ' Chincholi', ' Jevargi', ' Sedam'],
      },
      {
        name: 'Karwar',
        cities: ['Karwar', ' Ankola', ' Kumta', ' Honnavar', ' Siddapur'],
      },
      {
        name: 'Kolar',
        cities: ['Kolar', ' Bangarpet', ' Gauribidanur', ' Malur', ' Mulbagal'],
      },
      {
        name: 'Koppal',
        cities: ['Koppal', ' Gangavathi', ' Kanakagiri', ' Kustagi', ' Yelburga'],
      },
      {
        name: 'Madhya Kannada',
        cities: ['Madikeri', ' Ponnampet', ' Somwarpet', ' Virajpet', ' Madikeri'],
      },
      {
        name: 'Malavalli',
        cities: ['Malavalli', ' Krishnarajpet', ' Malvalli', ' Nagamangala', ' Pandavapura'],
      },
      {
        name: 'Mandya',
        cities: ['Mandya', ' Maddur', ' Malavalli', ' Srirangapatna', ' Pandavapura'],
      },
      {
        name: 'Mysore',
        cities: ['Mysore', ' Hunsur', ' K R Nagar', ' Periyapatna', ' T Narsipur'],
      },
      {
        name: 'Raichur',
        cities: ['Raichur', ' Devadurga', ' Lingsugur', ' Manvi', ' Sindhnur'],
      },
      {
        name: 'Ramanagara',
        cities: ['Ramanagara', ' Channapatna', ' Kanakapura', ' Magadi', ' Malvalli'],
      },
      {
        name: 'Shimoga',
        cities: ['Shimoga', ' Bhadravati', ' Sagar', ' Shikaripur', ' Soraba'],
      },
      {
        name: 'Tumkur',
        cities: ['Tumkur', ' Koratagere', ' Kunigal', ' Madhugiri', ' Pavagada'],
      },
      {
        name: 'Udupi',
        cities: ['Udupi', ' Kundapura', ' Byndoor', ' Karkala', ' Brahmavart'],
      },
      {
        name: 'Uttara Kannada',
        cities: ['Karwar', ' Ankola', ' Kumta', ' Honnavar', ' Sirsi'],
      },
      {
        name: 'Vijayapura',
        cities: ['Vijayapura', ' Basavana Bagewadi', ' Indi', ' Sindagi', ' Talikoti'],
      },
      {
        name: 'Yadgir',
        cities: ['Yadgir', ' Gurmatkal', ' Shahpur', ' Surpur', ' Yadgir'],
      },
    ],
  },
  {
    name: 'Kerala',
    districts: [
      {
        name: 'Alappuzha',
        cities: ['Alappuzha', ' Chengannur', ' Harippad', ' Kuttanad', ' Mavelikkara'],
      },
      {
        name: 'Ernakulam',
        cities: ['Kochi', ' Aluva', ' Angamaly', ' Kothamangalam', ' North Paravur'],
      },
      {
        name: 'Idukki',
        cities: ['Thodupuzha', ' Adimali', ' Devikulam', ' Kumily', ' Munnar'],
      },
      {
        name: 'Kannur',
        cities: ['Kannur', ' Payyanur', ' Thalassery', ' Wayanad', ' Kannur'],
      },
      {
        name: 'Kasaragod',
        cities: ['Kasaragod', ' Kanhangad', ' Nileshwaram', ' Trikaripur', ' Uppala'],
      },
      {
        name: 'Kollam',
        cities: ['Kollam', ' Kottarakara', ' Punalur', ' Paravur', ' Chavara'],
      },
      {
        name: 'Kottayam',
        cities: ['Kottayam', ' Changanassery', ' Ettumanoor', ' Pala', ' Vaikom'],
      },
      {
        name: 'Kozhikode',
        cities: ['Kozhikode', ' Vatakara', ' Koyilandy', ' Kunnamangalam', ' Perambra'],
      },
      {
        name: 'Malappuram',
        cities: ['Malappuram', ' Manjeri', ' Tirur', ' Ponnani', ' Kottakkunnu'],
      },
      {
        name: 'Palakkad',
        cities: ['Palakkad', ' Ottapalam', ' Shornur', ' Chittur', ' Alathur'],
      },
      {
        name: 'Pathanamthitta',
        cities: ['Pathanamthitta', ' Thiruvalla', ' Adoor', ' Ranni', ' Pampa'],
      },
      {
        name: 'Thiruvananthapuram',
        cities: ['Thiruvananthapuram', ' Neyyattinkara', ' Attingal', ' Varkala', ' Nedumangad'],
      },
      {
        name: 'Thrissur',
        cities: ['Thrissur', ' Chavakkad', ' Mukundapuram', ' Thalappilly', ' Chavakkad'],
      },
      {
        name: 'Wayanad',
        cities: ['Kalpetta', ' Sultan Bathery', ' Mananthavady', ' Pulpally', ' Sulthan Bathery'],
      },
    ],
  },
  {
    name: 'Madhya Pradesh',
    districts: [
      {
        name: 'Agar Malwa',
        cities: ['Agar', ' Susner', ' Badnawar', ' Alirajpur'],
      },
      {
        name: 'Alirajpur',
        cities: ['Alirajpur', ' Jobat', ' Selsura', ' Udaigarh'],
      },
      {
        name: 'Anuppur',
        cities: ['Anuppur', ' Kotma', ' Pushprajgarh', ' Jaithari'],
      },
      {
        name: 'Ashoknagar',
        cities: ['Ashoknagar', ' Chanderi', ' Isagarh', ' Shadhora'],
      },
      {
        name: 'Balaghat',
        cities: ['Balaghat', ' Waraseoni', ' Katangi', ' Lalbarra', ' Seoni'],
      },
      {
        name: 'Barwani',
        cities: ['Barwani', ' Sendhwa', ' Rajpur', ' Niwali', ' Pansemal'],
      },
      {
        name: 'Betul',
        cities: ['Betul', ' Multai', ' Amla', ' Bhainsdehi', ' Ghoradongri'],
      },
      {
        name: 'Bhind',
        cities: ['Bhind', ' Mehgaon', ' Gohad', ' Lahar', ' Raun'],
      },
      {
        name: 'Bhopal',
        cities: ['Bhopal', ' Berasia', ' Phanda', ' Kotra', ' Narela'],
      },
      {
        name: 'Burhanpur',
        cities: ['Burhanpur', ' Khaknar', ' Nepanagar', ' Shahpur'],
      },
      {
        name: 'Chhatarpur',
        cities: ['Chhatarpur', ' Harpalpur', ' Laundi', ' Bada Malhara', ' Rajnagar'],
      },
      {
        name: 'Chhindwara',
        cities: ['Chhindwara', ' Sausar', ' Pandhurna', ' Amarwara', ' Mohkhed'],
      },
      {
        name: 'Damoh',
        cities: ['Damoh', ' Hatta', ' Pathariya', ' Tendukheda', ' Jabalpur'],
      },
      {
        name: 'Datia',
        cities: ['Datia', ' Bhander', ' Seondha', ' Nivari'],
      },
      {
        name: 'Dewas',
        cities: ['Dewas', ' Sonkatch', ' Khategaon', ' Bagli', ' Tonk Khurd'],
      },
      {
        name: 'Dhar',
        cities: ['Dhar', ' Manawar', ' Sardarpur', ' Dhar', ' Badnawar'],
      },
      {
        name: 'Dindori',
        cities: ['Dindori', ' Shahpura', ' Amarpur', ' Mehani', ' Karanjia'],
      },
      {
        name: 'Guna',
        cities: ['Guna', ' Raghogarh', ' Aron', ' Chanchoda', ' Kumbhraj'],
      },
      {
        name: 'Gwalior',
        cities: ['Gwalior', ' Morar', ' Gwalior Rural', ' Dabra', ' Bhitarwar'],
      },
      {
        name: 'Harda',
        cities: ['Harda', ' Harda Kalan', ' Khirkiya', ' Sirali', ' Timarni'],
      },
      {
        name: 'Hoshangabad',
        cities: ['Hoshangabad', ' Seoni-Malwa', ' Babai', ' Itarsi', ' Pipariya'],
      },
      {
        name: 'Indore',
        cities: ['Indore', ' Mhow', ' Depalpur', ' Hatod', ' Sanwer'],
      },
      {
        name: 'Jabalpur',
        cities: ['Jabalpur', ' Kundam', ' Sihora', ' Patan', ' Majholi'],
      },
      {
        name: 'Jhabua',
        cities: ['Jhabua', ' Meghnagar', ' Thandla', ' Petlawad', ' Ranapur'],
      },
      {
        name: 'Katni',
        cities: ['Katni', ' Vijayraghavgarh', ' Rithi', ' Badwara', ' Murwara'],
      },
      {
        name: 'Khandwa',
        cities: ['Khandwa', ' Pandhana', ' Khandwa', ' Punasa', ' Mundi'],
      },
      {
        name: 'Khargone',
        cities: ['Khargone', ' Bhagwanpura', ' Kasrawad', ' Maheshwar', ' Segaon'],
      },
      {
        name: 'Mandla',
        cities: ['Mandla', ' Nainpur', ' Bichhiya', ' Mawai', ' Amarpur'],
      },
      {
        name: 'Mandsaur',
        cities: ['Mandsaur', ' Garoth', ' Malhargarh', ' Sitamau', ' Suwasra'],
      },
      {
        name: 'Morena',
        cities: ['Morena', ' Ambah', ' Joura', ' Kailaras', ' Rampura'],
      },
      {
        name: 'Narsinghpur',
        cities: ['Narsinghpur', ' Gotegaon', ' Kareli', ' Narsinghpur', ' Gadarwara'],
      },
      {
        name: 'Neemuch',
        cities: ['Neemuch', ' Jawad', ' Singoli', ' Manasa', ' Kukreshwar'],
      },
      {
        name: 'Panna',
        cities: ['Panna', ' Amanganj', ' Ajaygarh', ' Panna', ' Gunnore'],
      },
      {
        name: 'Raisen',
        cities: ['Raisen', ' Sultanpur', ' Begamganj', ' Gairatganj', ' Vidisha'],
      },
      {
        name: 'Rajgarh',
        cities: ['Rajgarh', ' Narsinghgarh', ' Biaora', ' Khilchipur', ' Sarangpur'],
      },
      {
        name: 'Ratlam',
        cities: ['Ratlam', ' Alot', ' Bajna', ' Jaora', ' Sailana'],
      },
      {
        name: 'Rewa',
        cities: ['Rewa', ' Raipur Karchuliyan', ' Teonthar', ' Sirmour', ' Jawa'],
      },
      {
        name: 'Sagar',
        cities: ['Sagar', ' Bina', ' Rehli', ' Banda', ' Jaisinagar'],
      },
      {
        name: 'Satna',
        cities: ['Satna', ' Amarpatan', ' Chitrakoot', ' Unchehara', ' Rampur Baghelan'],
      },
      {
        name: 'Sehore',
        cities: ['Sehore', ' Budni', ' Ashta', ' Ichhawar', ' Nalkheda'],
      },
      {
        name: 'Seoni',
        cities: ['Seoni', ' Lakhnadon', ' Barghat', ' Chhapara', ' Dhana'],
      },
      {
        name: 'Shajapur',
        cities: ['Shajapur', ' Agar', ' Shajapur', ' Kalapipal', ' Susner'],
      },
      {
        name: 'Sheopur',
        cities: ['Sheopur', ' Badoda', ' Beerpur', ' Kolaras', ' Vijaypur'],
      },
      {
        name: 'Shivpuri',
        cities: ['Shivpuri', ' Pohri', ' Karera', ' Khanpura', ' Kolaras'],
      },
      {
        name: 'Sidhi',
        cities: ['Sidhi', ' Churhat', ' Sihawal', ' Majhauli', ' Rampur Naikin'],
      },
      {
        name: 'Tikamgarh',
        cities: ['Tikamgarh', ' Prithvipur', ' Baldeogarh', ' Niwari', ' Jatara'],
      },
      {
        name: 'Ujjain',
        cities: ['Ujjain', ' Badnagar', ' Ghatiya', ' Tarana', ' Mahidpur'],
      },
      {
        name: 'Umaria',
        cities: ['Umaria', ' Pali', ' Chandia', ' Manpur', ' Ketma'],
      },
      {
        name: 'Vidisha',
        cities: ['Vidisha', ' Basoda', ' Kurwai', ' Ganj Basoda', ' Lateri'],
      },
    ],
  },
  {
    name: 'Maharashtra',
    districts: [
      {
        name: 'Ahmednagar',
        cities: ['Ahmednagar', ' Shrirampur', ' Pathardi', ' Jamkhed', ' Karjat'],
      },
      {
        name: 'Akola',
        cities: ['Akola', ' Akot', ' Telhara', ' Barshitakli', ' Murtijapur'],
      },
      {
        name: 'Amravati',
        cities: ['Amravati', ' Achalpur', ' Daryapur', ' Chandurbazar', ' Warud'],
      },
      {
        name: 'Aurangabad',
        cities: ['Aurangabad', ' Paithan', ' Phulambri', ' Dindori', ' Soygaon'],
      },
      {
        name: 'Beed',
        cities: ['Beed', ' Gevrai', ' Parali', ' Majalgaon', ' Ashti'],
      },
      {
        name: 'Bhandara',
        cities: ['Bhandara', ' Tumsar', ' Lakhandur', ' Mohadi', ' Pauni'],
      },
      {
        name: 'Bidar',
        cities: ['Bidar', ' Basavakalyan', ' Bhalki', ' Humnabad', ' Aurad'],
      },
      {
        name: 'Buldhana',
        cities: ['Buldhana', ' Malkapur', ' Nandura', ' Shegaon', ' Khamgaon'],
      },
      {
        name: 'Chandrapur',
        cities: ['Chandrapur', ' Gadchandur', ' Mul', ' Bhadrawati', ' Rajura'],
      },
      {
        name: 'Dhule',
        cities: ['Dhule', ' Nandurbar', ' Pimpalner', ' Shirpur', ' Sindkhede'],
      },
      {
        name: 'Gadchiroli',
        cities: ['Gadchiroli', ' Aheri', ' Armori', ' Chamorshi', ' Mulchera'],
      },
      {
        name: 'Gondia',
        cities: ['Gondia', ' Tirora', ' Goregaon', ' Amgaon', ' Salekasa'],
      },
      {
        name: 'Hingoli',
        cities: ['Hingoli', ' Sengaon', ' Basmath', ' Kalaman', ' Hingoli'],
      },
      {
        name: 'Jalgaon',
        cities: ['Jalgaon', ' Bhusawal', ' Yaval', ' Raver', ' Chopda'],
      },
      {
        name: 'Jalna',
        cities: ['Jalna', ' Badnapur', ' Ambad', ' Bhokardhan', ' Mantha'],
      },
      {
        name: 'Kolhapur',
        cities: ['Kolhapur', ' Ichalkaranji', ' Radhanagari', ' Kagal', ' Hatkanangale'],
      },
      {
        name: 'Latur',
        cities: ['Latur', ' Udgir', ' Ahmedpur', ' Ausa', ' Chakur'],
      },
      {
        name: 'Mumbai',
        cities: ['Mumbai', ' Mumbai Suburban', ' Mumbai City', ' Navi Mumbai', ' Thane'],
      },
      {
        name: 'Nagpur',
        cities: ['Nagpur', ' Katol', ' Kalameshwar', ' Ramtek', ' Kuhi'],
      },
      {
        name: 'Nanded',
        cities: ['Nanded', ' Loha', ' Mukhed', ' Deglur', ' Kandhar'],
      },
      {
        name: 'Nandurbar',
        cities: ['Nandurbar', ' Shahade', ' Taloda', ' Nawapur', ' Akkalkuwa'],
      },
      {
        name: 'Nashik',
        cities: ['Nashik', ' Sinnar', ' Igatpuri', ' Trimbakeshwar', ' Dindori'],
      },
      {
        name: 'Osmanabad',
        cities: ['Osmanabad', ' Tuljapur', ' Bhoom', ' Kalamb', ' Lohara'],
      },
      {
        name: 'Palghar',
        cities: ['Palghar', ' Vasai', ' Virar', ' Talasari', ' Vikramgad'],
      },
      {
        name: 'Parbhani',
        cities: ['Parbhani', ' Gangakhed', ' Manwat', ' Pathri', ' Jintur'],
      },
      {
        name: 'Pune',
        cities: ['Pune', ' Pimpri-Chinchwad', ' Hinjewadi', ' Talegaon', ' Shirur'],
      },
      {
        name: 'Raigad',
        cities: ['Alibag', ' Panvel', ' Karjat', ' Khalapur', ' Uran'],
      },
      {
        name: 'Ratnagiri',
        cities: ['Ratnagiri', ' Dapoli', ' Khed', ' Sangameshwar', ' Guhagar'],
      },
      {
        name: 'Sangli',
        cities: ['Sangli', ' Miraj', ' Tasgaon', ' Kavthe Mahankal', ' Walwa'],
      },
      {
        name: 'Satara',
        cities: ['Satara', ' Karad', ' Koregaon', ' Phaltan', ' Mahabaleshwar'],
      },
      {
        name: 'Sindhudurg',
        cities: ['Sindhudurg', ' Kankavli', ' Kudal', ' Vengurla', ' Malvan'],
      },
      {
        name: 'Solapur',
        cities: ['Solapur', ' Akkalkot', ' Mohol', ' Sangola', ' Pandharpur'],
      },
      {
        name: 'Thane',
        cities: ['Thane', ' Navi Mumbai', ' Kalyan-Dombivali', ' Ulhasnagar', ' Bhiwandi'],
      },
      {
        name: 'Wardha',
        cities: ['Wardha', ' Arvi', ' Hinganghat', ' Seloo', ' Ashti'],
      },
      {
        name: 'Washim',
        cities: ['Washim', ' Risod', ' Mangrulpir', ' Karanja', ' Malegaon'],
      },
      {
        name: 'Yavatmal',
        cities: ['Yavatmal', ' Darwha', ' Pandharkawada', ' Umerkhed', ' Pusad'],
      },
    ],
  },
  {
    name: 'Manipur',
    districts: [
      {
        name: 'Bishnupur',
        cities: ['Bishnupur', ' Moirang', ' Thoubal', ' Imphal', ' Kakching'],
      },
      {
        name: 'Chandel',
        cities: ['Chandel', ' Chakpikarong', ' Tengnoupal', ' Moreh', ' Chandel'],
      },
      {
        name: 'Churachandpur',
        cities: ['Churachandpur', ' Singngat', ' Thanlon', ' Vengnome', ' Henglep'],
      },
      {
        name: 'Imphal East',
        cities: ['Imphal East', ' Jiribam', ' Porompat', ' Keirao', ' Wangkhei'],
      },
      {
        name: 'Imphal West',
        cities: ['Imphal West', ' Lamlong', ' Sekmai', ' Patsoi', ' Irom Meetei'],
      },
      {
        name: 'Jiribam',
        cities: ['Jiribam', ' Jiribam', ' Borobekra', ' Silchar', ' Borkhola'],
      },
      {
        name: 'Kakching',
        cities: ['Kakching', ' Kakching', ' Wangoo', ' Hiyanglam', ' Waikhong'],
      },
      {
        name: 'Kamjong',
        cities: ['Kamjong', ' Kamjong', ' Kasom Khullen', ' Chakpikarong', ' Sempang'],
      },
      {
        name: 'Kangpokpi',
        cities: ['Kangpokpi', ' Kangpokpi', ' Saikul', ' Tadou', ' Purul'],
      },
      {
        name: 'Noney',
        cities: ['Noney', ' Noney', ' Khoupum', ' Longmai', ' Haleho'],
      },
      {
        name: 'Pherzawl',
        cities: ['Pherzawl', ' Pherzawl', ' Tamenglong', ' Tamei', ' Azuram'],
      },
      {
        name: 'Senapati',
        cities: ['Senapati', ' Senapati', ' Mao', ' Maram', ' Purul'],
      },
      {
        name: 'Tamenglong',
        cities: ['Tamenglong', ' Tamenglong', ' Tamei', ' Khongjar', ' Rengpang'],
      },
      {
        name: 'Tengnoupal',
        cities: ['Tengnoupal', ' Tengnoupal', ' Moreh', ' Chakpikarong', ' Kasom Khullen'],
      },
      {
        name: 'Thoubal',
        cities: ['Thoubal', ' Thoubal', ' Wangjing', ' Kakching', ' Hiyanglam'],
      },
      {
        name: 'Ukhrul',
        cities: ['Ukhrul', ' Ukhrul', ' Kamjong', ' Jessami', ' Chingai'],
      },
    ],
  },
  {
    name: 'Meghalaya',
    districts: [
      {
        name: 'East Garo Hills',
        cities: ['Williamnagar', ' Resubelpara', ' Songsak', ' Dambo Rong', ' Samanda'],
      },
      {
        name: 'East Jaintia Hills',
        cities: ['Khliehriat', ' Jowai', ' Dawki', ' Umkiang', ' Sutnga'],
      },
      {
        name: 'East Khasi Hills',
        cities: ['Shillong', ' Sohra', ' Mawphlang', ' Mylliem', ' Cherrapunjee'],
      },
      {
        name: 'North Garo Hills',
        cities: ['Baghmara', ' Resubelpara', ' Chokpot', ' Rongrengiri', ' Betasing'],
      },
      {
        name: 'Ri Bhoi',
        cities: ['Nongpoh', ' Jirang', ' Umsning', ' Bhoirymbong', ' Patharkhmah'],
      },
      {
        name: 'South Garo Hills',
        cities: ['Baghmara', ' Gasuapara', ' Rongara', ' Chokpot', ' Pedong'],
      },
      {
        name: 'South West Garo Hills',
        cities: ['Ampati', ' Zikzak', ' Betasing', ' Rongsok', ' Zamtok'],
      },
      {
        name: 'South West Khasi Hills',
        cities: ['Mawkyrwat', ' Ranikor', ' Nongkrem', ' Mawsynram', ' Khadar'],
      },
      {
        name: 'West Garo Hills',
        cities: ['Tura', ' Aminjabil', ' Dadenggiri', ' Phulbari', ' Balat'],
      },
      {
        name: 'West Jaintia Hills',
        cities: ['Jowai', ' Lakhiat', ' Smit', ' Thadlaskein', ' Amlarem'],
      },
      {
        name: 'West Khasi Hills',
        cities: ['Nongstoin', ' Mawthad', ' Pariong', ' Mairang', ' Mawshynrut'],
      },
    ],
  },
  {
    name: 'Mizoram',
    districts: [
      {
        name: 'Aizawl',
        cities: ['Aizawl', ' Darlawn', ' Phullen', 'Thingsulthliah', ' Reiek'],
      },
      {
        name: 'Champhai',
        cities: ['Champhai', ' Khawzawl', ' Zawlnuam', ' E Lungdar', ' Vanbawng'],
      },
      {
        name: 'Hnahthial',
        cities: ['Hnahthial', ' Hnahthial', ' Lungphuiel', ' Selesih', 'Thingsulthliah'],
      },
      {
        name: 'Kolasib',
        cities: ['Kolasib', ' Bilkhawthlir', ' Kawnpui', ' Thingdawl', ' Vaitin'],
      },
      {
        name: 'Lawngtlai',
        cities: ['Lawngtlai', ' Sangau', ' Chawngte', ' Bureaul', ' Hmawngchhuah'],
      },
      {
        name: 'Lunglei',
        cities: ['Lunglei', ' Hnahthial', ' Bunghmun', ' Chhimtuipui', 'Lungsen'],
      },
      {
        name: 'Mamit',
        cities: ['Mamit', ' Reiek', ' Zawlnuam', ' W. Phaileng', ' Kawrthah'],
      },
      {
        name: 'Saiha',
        cities: ['Saiha', ' Tuipang', ' Bualte', ' Saiha', ' Kawlchaw'],
      },
      {
        name: 'Serchhip',
        cities: ['Serchhip', ' Hliappui', ' Thingsulthliah', ' Serchhip', ' E. Lungdar'],
      },
    ],
  },
  {
    name: 'Nagaland',
    districts: [
      {
        name: 'Chümoukedima',
        cities: ['Chümoukedima', ' Niuland', ' Medziphema', ' Diphupar', ' Seithekima'],
      },
      {
        name: 'Dimapur',
        cities: ['Dimapur', ' Chümoukedima', ' Niuland', ' Kuhuboto', ' Dhansiripar'],
      },
      {
        name: 'Kiphire',
        cities: ['Kiphire', ' Seyochung', ' Amahata', ' Khongsoh', ' Pungro'],
      },
      {
        name: 'Kohima',
        cities: ['Kohima', ' Jakhama', ' Chiephobozou', ' Tseminyu', ' Viswema'],
      },
      {
        name: 'Longleng',
        cities: ['Longleng', ' Tamlu', ' Namsang', ' Sakshi', ' Yachem'],
      },
      {
        name: 'Mokokchung',
        cities: ['Mokokchung', ' Changtongya', ' Alongkima', ' Tuli', ' Koblong'],
      },
      {
        name: 'Mon',
        cities: ['Mon', ' Tizit', ' Aboi', ' Chen', ' Monyakshu'],
      },
      {
        name: 'Niuland',
        cities: ['Niuland', ' Chümoukedima', ' Kuhuboto', ' Duthloh', ' Nihokhu'],
      },
      {
        name: 'Noklak',
        cities: ['Noklak', ' Noklak', ' Panso', ' Thonoknyu', ' ChCutting'],
      },
      {
        name: 'Noney',
        cities: ['Noney', ' Noney', ' Khongl', ' Longmah', ' Haoch'],
      },
      {
        name: 'Peren',
        cities: ['Peren', ' Athibung', ' Jalukie', ' Kebong', ' Tening'],
      },
      {
        name: 'Phek',
        cities: ['Phek', ' Chetheba', ' Khusvema', ' Khezhakeno', ' Pfutsero'],
      },
      {
        name: 'Tseminyu',
        cities: ['Tseminyu', ' Kohima', ' Jakhama', ' Tseminyu', ' Chiephobozou'],
      },
      {
        name: 'Tuensang',
        cities: ['Tuensang', ' Noklak', ' ChCutting', ' Sangsangnyu', ' Tsada'],
      },
      {
        name: 'Wokha',
        cities: ['Wokha', ' Wokha', ' Bhandari', ' Changpang', ' Sanis'],
      },
      {
        name: 'Zunheboto',
        cities: ['Zunheboto', ' Zunheboto', ' Akhulito', ' Athabhunga', ' Zapami'],
      },
    ],
  },
  {
    name: 'Odisha',
    districts: [
      {
        name: 'Angul',
        cities: ['Angul', ' Talcher', ' Banarpal', ' Chhendipada', ' Kishorenagar'],
      },
      {
        name: 'Balangir',
        cities: ['Balangir', ' Titlagarh', ' Loisingha', ' Saintala', ' Bongomunda'],
      },
      {
        name: 'Balasore',
        cities: ['Balasore', ' Soro', ' Baleshwar', ' Nilagiri', ' Jaleswar'],
      },
      {
        name: 'Bargarh',
        cities: ['Bargarh', ' Padmapur', ' Sohela', ' Barpali', ' Attabira'],
      },
      {
        name: 'Bhadrak',
        cities: ['Bhadrak', ' Dhamnagar', ' Chandbali', ' Basudebpur', ' Bhandaripokhari'],
      },
      {
        name: 'Boudh',
        cities: ['Boudh', ' Boudh', ' Harabhanga', ' Manamunda', ' Kantar'],
      },
      {
        name: 'Cuttack',
        cities: ['Cuttack', ' Jagatsinghpur', ' Jajpur', ' Dhenkanal', ' Kendrapara'],
      },
      {
        name: 'Debagarh',
        cities: ['Debagarh', ' Reamal', ' Govindpur', ' Bargarh', ' Jamulia'],
      },
      {
        name: 'Dhenkanal',
        cities: ['Dhenkanal', ' Kamakhyanagar', ' Bhuban', ' Parjang', ' Hindol'],
      },
      {
        name: 'Gajapati',
        cities: ['Gajapati', ' Paralakhemundi', ' Mohana', ' R. Udayagiri', ' Nuagada'],
      },
      {
        name: 'Ganjam',
        cities: ['Ganjam', ' Berhampur', ' Chhatrapur', ' Hinjilicut', ' Digapahandi'],
      },
      {
        name: 'Jagatsinghpur',
        cities: ['Jagatsinghpur', ' Paradip', ' Tirtol', ' Balikuda', ' Erasama'],
      },
      {
        name: 'Jajpur',
        cities: ['Jajpur', ' Jajpur Road', ' Binjharpur', ' Sukinda', ' Danagadi'],
      },
      {
        name: 'Jharsuguda',
        cities: ['Jharsuguda', ' Redhakhol', ' Laikera', ' Kirmira', ' Badmal'],
      },
      {
        name: 'Kalahandi',
        cities: ['Kalahandi', ' Bhawanipatna', ' Junagarh', ' Dharmagarh', ' Lanjigarh'],
      },
      {
        name: 'Kandhamal',
        cities: ['Kandhamal', ' Phulbani', ' Balliguda', ' G. Udayagiri', ' Kotagarh'],
      },
      {
        name: 'Kendrapara',
        cities: ['Kendrapara', ' Pattamundai', ' Rajanagar', ' Aali', ' Garadpur'],
      },
      {
        name: 'Keonjhar',
        cities: ['Keonjhar', ' Barbil', ' Champua', ' Ghatgaon', ' Joda'],
      },
      {
        name: 'Khordha',
        cities: ['Khordha', ' Bhubaneswar', ' Balugaon', ' Tangi', ' Banapur'],
      },
      {
        name: 'Koraput',
        cities: ['Koraput', ' Jeypore', ' Sunabeda', ' Kotpad', ' Boipariguda'],
      },
      {
        name: 'Malkangiri',
        cities: ['Malkangiri', ' Malkangiri', ' Mathili', ' Korukonda', ' Podia'],
      },
      {
        name: 'Mayurbhanj',
        cities: ['Mayurbhanj', ' Bariporda', ' Udala', ' Karanjia', ' Jashipur'],
      },
      {
        name: 'Nabarangpur',
        cities: ['Nabarangpur', ' Umerkote', ' Papadahandi', ' Jharigan', ' Tentulikhunti'],
      },
      {
        name: 'Nayagarh',
        cities: ['Nayagarh', ' Nayagarh', ' Khandapada', ' Odagaon', ' Dasapalla'],
      },
      {
        name: 'Nuapada',
        cities: ['Nuapada', ' Khariar', ' Komna', ' Sinapali', ' Boden'],
      },
      {
        name: 'Puri',
        cities: ['Puri', ' Puri', ' Sakhigopal', ' Satyabadi', ' Gop'],
      },
      {
        name: 'Rayagada',
        cities: ['Rayagada', ' Rayagada', ' Gunupur', ' Kolnara', ' Padmapur'],
      },
      {
        name: 'Sambalpur',
        cities: ['Sambalpur', ' Sambalpur', ' Rairangpur', ' Kuchinda', ' Jujomunda'],
      },
      {
        name: 'Subarnapur',
        cities: ['Subarnapur', ' Subarnapur', ' Birmaharajpur', ' Dunguripali', ' Binka'],
      },
      {
        name: 'Sundargarh',
        cities: ['Sundargarh', ' Rourkela', ' Sundargarh', ' Rajagangapur', ' Bonai'],
      },
    ],
  },
  {
    name: 'Puducherry',
    districts: [
      {
        name: 'Karaikal',
        cities: ['Karaikal', ' Nedungadu', ' Tirunallar', ' Kottucherry', ' Thirumalairayanpattinam'],
      },
      {
        name: 'Mahe',
        cities: ['Mahe', ' Mahe', ' Palloor', ' Pandakkal', ' Chitira'],
      },
      {
        name: 'Puducherry',
        cities: ['Puducherry', ' Ozhukarai', ' Villianur', ' Ariyur', ' Koodapakkam'],
      },
      {
        name: 'Yanam',
        cities: ['Yanam', ' Yanam', ' Kovarvill', ' Savithri Nagar', ' Uppampattinam'],
      },
    ],
  },
  {
    name: 'Punjab',
    districts: [
      {
        name: 'Amritsar',
        cities: ['Amritsar', ' Ajnala', ' Majitha', ' Rayya', ' Tarn Taran'],
      },
      {
        name: 'Barnala',
        cities: ['Barnala', ' Sehna', ' Ahmedgarh', ' Talwandi Sangrur', ' Dhanaula'],
      },
      {
        name: 'Bathinda',
        cities: ['Bathinda', ' Rampura', ' Maur', ' Talwandi Sabo', ' Giddarbaha'],
      },
      {
        name: 'Faridkot',
        cities: ['Faridkot', ' Jaitu', ' Kot Kapura', ' Sangat', ' Baghela'],
      },
      {
        name: 'Fatehgarh Sahib',
        cities: ['Fatehgarh Sahib', ' Bassi Pathana', ' Amloh', ' Khamano', ' Khera'],
      },
      {
        name: 'Fazilka',
        cities: ['Fazilka', ' Abohar', ' Jalalabad', ' Khuian Sarwar', ' Vikas'],
      },
      {
        name: 'Ferozepur',
        cities: ['Ferozepur', ' Zira', ' Fazilka', ' Guru Har Sahai', ' Dharamkot'],
      },
      {
        name: 'Gurdaspur',
        cities: ['Gurdaspur', ' Batala', ' Dinanagar', ' Dhariwal', ' Fateh Nangal'],
      },
      {
        name: 'Hoshiarpur',
        cities: ['Hoshiarpur', ' Dasuya', ' Mukerian', ' Talwara', ' Garhshankar'],
      },
      {
        name: 'Jalandhar',
        cities: ['Jalandhar', ' Nakodar', ' Phillaur', ' Shahkot', ' Adampur'],
      },
      {
        name: 'Kapurthala',
        cities: ['Kapurthala', ' Jalandhar', ' Phillaur', ' Bholath', ' Sultanpur Lodhi'],
      },
      {
        name: 'Ludhiana',
        cities: ['Ludhiana', ' Samrala', ' Khanna', ' Payal', ' Raikot'],
      },
      {
        name: 'Mansa',
        cities: ['Mansa', ' Budhlada', ' Sardulgarh', ' Jhunir', ' Kishankot'],
      },
      {
        name: 'Moga',
        cities: ['Moga', ' Bagha Purana', ' Nihal Singh Wala', ' Dharamkot', ' Kot Ise Khan'],
      },
      {
        name: 'Muktsar',
        cities: ['Muktsar', ' Malout', ' Giddarbaha', ' Doda', ' Lambi'],
      },
      {
        name: 'Pathankot',
        cities: ['Pathankot', ' Pathankot', ' Bamial', ' Gurdaspur', ' Dinanagar'],
      },
      {
        name: 'Patiala',
        cities: ['Patiala', ' Rajpura', ' Nabha', ' Samana', ' Ghagga'],
      },
      {
        name: 'Rupnagar',
        cities: ['Rupnagar', ' Anandpur Sahib', ' Morinda', ' Chamkaur Sahib', ' Nangal'],
      },
      {
        name: 'Sangrur',
        cities: ['Sangrur', ' Barnala', ' Dhuri', ' Lehragaga', ' Moonak'],
      },
      {
        name: 'Sahibzada Ajit Singh Nagar',
        cities: ['Mohali', ' Dera Bassi', ' Kharar', ' Zirakpur', ' Kurali'],
      },
      {
        name: 'Sri Muktsar Sahib',
        cities: ['Muktsar', ' Malout', ' Giddarbaha', ' Doda', ' Lambi'],
      },
      {
        name: 'Tarn Taran',
        cities: ['Tarn Taran', ' Patti', ' Khadur Sahib', ' Naushahra Panwan', ' Chohla Sahib'],
      },
    ],
  },
  {
    name: 'Rajasthan',
    districts: [
      {
        name: 'Ajmer',
        cities: ['Ajmer', ' Kishangarh', ' Beawar', ' Masuda', ' Kekri'],
      },
      {
        name: 'Alwar',
        cities: ['Alwar', ' Tijara', ' Kathumar', ' Laxmangarh', ' Rajgarh'],
      },
      {
        name: 'Jaipur',
        cities: ['Jaipur'],
      },
      {
        name: 'Banswara',
        cities: ['Banswara', ' Kushalgarh', ' Bagidora', ' Ghatol', ' Talwara'],
      },
      {
        name: 'Baran',
        cities: ['Baran', ' Atru', ' Chhabra', ' Kishanganj', ' Shahbad'],
      },
      {
        name: 'Barmer',
        cities: ['Barmer', ' Jaisalmer', ' Balotra', ' Gudha Malani', ' Sheo'],
      },
      {
        name: 'Bharatpur',
        cities: ['Bharatpur', ' Deeg', ' Kaman', ' Kumher', ' Nadbai'],
      },
      {
        name: 'Bhilwara',
        cities: ['Bhilwara', ' Asind', ' Hurda', ' Kotri', ' Sahara'],
      },
      {
        name: 'Bikaner',
        cities: ['Bikaner', ' Nokha', ' Loonkaransar', ' Khajuwala', ' Deshnoke'],
      },
      {
        name: 'Bundi',
        cities: ['Bundi', ' Keshoraipatan', ' Nainwa', ' Hindoli', ' Indragarh'],
      },
      {
        name: 'Chittorgarh',
        cities: ['Chittorgarh', ' Nimbahera', ' Chhoti Sadri', ' Bassi', ' Begun'],
      },
      {
        name: 'Churu',
        cities: ['Churu', ' Ratangarh', ' Sardarshahar', ' Sujangarh', ' Rajaldesar'],
      },
      {
        name: 'Dausa',
        cities: ['Dausa', ' Mahwa', ' Sikrai', ' Lalsot', ' Bandikui'],
      },
      {
        name: 'Dholpur',
        cities: ['Dholpur', ' Rajakhera', ' Baseri', ' Bari', ' Sirmora'],
      },
      {
        name: 'Dungarpur',
        cities: ['Dungarpur', ' Bichhiwara', ' Sabla', ' Galiakot', ' Simalwara'],
      },
      {
        name: 'Ganganagar',
        cities: ['Sri Ganganagar', ' Raisinghnagar', ' Anoopgarh', ' Karanpur', ' Vijayanagar'],
      },
      {
        name: 'Hanumangarh',
        cities: ['Hanumangarh', ' Nohar', ' Rawatsar', ' Tibi', ' Bhadra'],
      },
      {
        name: 'Jalore',
        cities: ['Jalore', ' Sanchore', ' Bhinmal', ' Ahore', ' Sayla'],
      },
      {
        name: 'Jhalawar',
        cities: ['Jhalawar', ' Jhalrapatan', ' Khanpur', ' Aklera', ' Sunel'],
      },
      {
        name: 'Jhunjhunu',
        cities: ['Jhunjhunu', ' Udaipurwati', ' Pilani', ' Khetri', ' Chirawa'],
      },
      {
        name: 'Jodhpur',
        cities: ['Jodhpur', ' Osian', ' Luni', ' Balesar', ' Pipar City'],
      },
      {
        name: 'Karauli',
        cities: ['Karauli', ' Hindaun', ' Mandrail', ' Todabhim', ' Sapotra'],
      },
      {
        name: 'Kota',
        cities: ['Kota', ' Ladpura', ' Sangod', ' Pipalda', ' Keshoraipatan'],
      },
      {
        name: 'Nagaur',
        cities: ['Nagaur', ' Merta', ' Parbatsar', ' Ladnun', ' Degana'],
      },
      {
        name: 'Pali',
        cities: ['Pali', ' Sumerpur', ' Jaitaran', ' Sojat', ' Rohat'],
      },
      {
        name: 'Pratapgarh',
        cities: ['Pratapgarh', ' Chhoti Sadri', ' Arnod', ' Peepathadevi', ' Ghatol'],
      },
      {
        name: 'Rajsamand',
        cities: ['Rajsamand', ' Kankroli', ' Nathdwara', ' Railmagra', ' Amet'],
      },
      {
        name: 'Sawai Madhopur',
        cities: ['Sawai Madhopur', ' Khandela', ' Malarna Doongar', ' Bonli', ' Gangapur'],
      },
      {
        name: 'Sikar',
        cities: ['Sikar', ' Neem Ka Thana', ' Laxmangarh', ' Khandela', ' Danta'],
      },
      {
        name: 'Sirohi',
        cities: ['Sirohi', ' Sheoganj', ' Abu Road', ' Reodar', ' Pindwara'],
      },
      {
        name: 'Sri Ganganagar',
        cities: ['Sri Ganganagar', ' Raisinghnagar', ' Anoopgarh', ' Karanpur', ' Vijayanagar'],
      },
      {
        name: 'Tonk',
        cities: ['Tonk', ' Deoli', ' Uniara', ' Malpura', ' Niwai'],
      },
      {
        name: 'Udaipur',
        cities: ['Udaipur', ' Girwa', ' Kotra', ' Badgaon', ' Vallabhnagar'],
      },
    ],
  },
  {
    name: 'Sikkim',
    districts: [
      {
        name: 'East Sikkim',
        cities: ['Gangtok', ' Pakyong', ' Rongli', ' Rhenock', ' Regu'],
      },
      {
        name: 'North Sikkim',
        cities: ['Mangan', ' Lachen', ' Lachung', ' Chungthang', ' Kabi'],
      },
      {
        name: 'South Sikkim',
        cities: ['Namchi', ' Gyalshing', ' Jorethang', ' Ravong', ' Sikkip'],
      },
      {
        name: 'West Sikkim',
        cities: ['Gyalshing', ' Yuksom', ' Dentam', ' Rinchenpong', ' Kabi'],
      },
    ],
  },
  {
    name: 'Tamil Nadu',
    districts: [
      {
        name: 'Ariyalur',
        cities: ['Ariyalur', ' Sendurai', ' Andimadam', ' Udayarpalayam', ' T. Palur'],
      },
      {
        name: 'Chennai',
        cities: ['Chennai', ' Ambattur', ' Ayanambakkam', ' Avadi', ' Madhavaram'],
      },
      {
        name: 'Coimbatore',
        cities: ['Coimbatore', ' Pollachi', ' Mettupalayam', ' Udumalpet', ' Sathyamangalam'],
      },
      {
        name: 'Cuddalore',
        cities: ['Cuddalore', ' Chidambaram', ' Panruti', ' Kattumannarkoil', ' Vridhachalam'],
      },
      {
        name: 'Dharmapuri',
        cities: ['Dharmapuri', ' Harur', ' Palacode', ' Pennagaram', ' Karimangalam'],
      },
      {
        name: 'Dindigul',
        cities: ['Dindigul', ' Batlagundu', ' Kodaikanal', ' Nilakkottai', ' Vedasandur'],
      },
      {
        name: 'Erode',
        cities: ['Erode', ' Bhavani', ' Perundurai', ' Gobichettipalayam', ' Sathyamangalam'],
      },
      {
        name: 'Kallakurichi',
        cities: ['Kallakurichi', ' Tirukkannamangai', ' Ulundurpettai', ' Sankarapuram', ' Chinnasalem'],
      },
      {
        name: 'Kanchipuram',
        cities: ['Kanchipuram', ' Sriperumbudur', ' Walajabad', ' Kattankulathur', ' Thiruporur'],
      },
      {
        name: 'Kanyakumari',
        cities: ['Nagercoil', ' Thuckalay', ' Marthandam', ' Kuzhithurai', ' Padmanabhapuram'],
      },
      {
        name: 'Karur',
        cities: ['Karur', ' Krishnarayapuram', ' Aravakkurichi', ' Kadavur', ' Thogamalai'],
      },
      {
        name: 'Krishnagiri',
        cities: ['Krishnagiri', ' Hosur', ' Denkanikottai', ' Shoolagiri', ' Kaveripattinam'],
      },
      {
        name: 'Madurai',
        cities: ['Madurai', ' Melur', ' Usilampatti', ' Thirumangalam', ' Alangulam'],
      },
      {
        name: 'Mayiladuthurai',
        cities: ['Mayiladuthurai', ' Sirkazhi', ' Thiruvarur', ' Kumbakonam', ' Poompuhar'],
      },
      {
        name: 'Nagapattinam',
        cities: ['Nagapattinam', ' Kilvelur', ' Vedaranyam', ' Thiruthiraipoondi', ' Keelvayal'],
      },
      {
        name: 'Namakkal',
        cities: ['Namakkal', ' Paramathi Velur', ' Rasipuram', ' Kolli Hills', ' Mohanur', 'Thiruchengode'],
      },
      {
        name: 'Nilgiris',
        cities: ['Ooty', ' Coonoor', ' Gudalur', ' Kotagiri', ' Wellington'],
      },
      {
        name: 'Perambalur',
        cities: ['Perambalur', ' Alathur', ' Veppanthattai', ' Kunnam', ' Anjur'],
      },
      {
        name: 'Pudukkottai',
        cities: ['Pudukkottai', ' Aranthangi', ' Alangudi', ' Iluppur', ' Viralur'],
      },
      {
        name: 'Ramanathapuram',
        cities: ['Ramanathapuram', ' Paramakudi', ' Mudukulathur', ' Kamuthi', ' Kadaladi'],
      },
      {
        name: 'Salem',
        cities: ['Salem', ' Mettur', ' Sankagiri', ' Omalur', ' Yercaud'],
      },
      {
        name: 'Sivaganga',
        cities: ['Sivaganga', ' Karaikudi', ' Devakottai', ' Manamadurai', ' Singampuneri'],
      },
      {
        name: 'Tenkasi',
        cities: ['Tenkasi', ' Sankarankovil', ' Alangulam', ' Thiruvengadam', ' Kadayanallur'],
      },
      {
        name: 'Thanjavur',
        cities: ['Thanjavur', ' Kumbakonam', ' Papanasam', ' Orathanadu', ' Thiruppanandal'],
      },
      {
        name: 'Theni',
        cities: ['Theni', ' Bodinayakanur', ' Uthamapalayam', ' Andipatti', ' Periyakulam'],
      },
      {
        name: 'Thiruvallur',
        cities: ['Thiruvallur', ' Avadi', ' Ambattur', ' Poonamallee', ' Tiruttani'],
      },
      {
        name: 'Thiruvarur',
        cities: ['Thiruvarur', ' Mannargudi', ' Nannilam', ' Valangaiman', ' Kodavasal'],
      },
      {
        name: 'Thoothukudi',
        cities: ['Thoothukudi', ' Kovilpatti', ' Ottapidaram', ' Srivaikundam', ' Sathankulam'],
      },
      {
        name: 'Tiruchirappalli',
        cities: ['Tiruchirappalli', ' Srirangam', ' Manachanallur', ' Musiri', ' Thuraiyur'],
      },
      {
        name: 'Tirunelveli',
        cities: ['Tirunelveli', ' Ambasamudram', ' Sankarankovil', ' Nanguneri', ' Cheranmahadevi'],
      },
      {
        name: 'Tiruppur',
        cities: ['Tiruppur', ' Dharapuram', ' Udumalpet', ' Kangeyam', ' Palladam', ' Avanashi', ' Uthukuli', ' Madathukulam', ' Mulanur'],
      },
      {
        name: 'Vellore',
        cities: ['Vellore', ' Katpadi', ' Gudiyatham', ' Ranipet', ' Arakonam'],
      },
      {
        name: 'Viluppuram',
        cities: ['Viluppuram', ' Tindivanam', ' Gingee', ' Kallakkurich', ' Marakkanam'],
      },
      {
        name: 'Virudhunagar',
        cities: ['Virudhunagar', ' Sivakasi', ' Rajapalayam', ' Aruppukottai', ' Sattur'],
      },
    ],
  },
  {
    name: 'Telangana',
    districts: [
      {
        name: 'Adilabad',
        cities: ['Adilabad', ' Asifabad', ' Boath', ' Ichoda', ' Kouthala'],
      },
      {
        name: 'Bhadradri Kothagudem',
        cities: ['Kothagudem', ' Paloncha', ' Yellandu', ' Aswaraopeta', ' Dummugudem'],
      },
      {
        name: 'Hyderabad',
        cities: ['Hyderabad', ' Secunderabad', ' Charminar', ' Golkonda', ' Secunderabad'],
      },
      {
        name: 'Jagitial',
        cities: ['Jagitial', ' Metpally', ' Raikal', ' Dharmapuri', ' Beerpur'],
      },
      {
        name: 'Jangaon',
        cities: ['Jangaon', ' Zahirabad', ' Lingagiri', ' Kodakandla', ' Raghunathpalli'],
      },
      {
        name: 'Jayashankar Bhupalapally',
        cities: ['Peddapalli', ' Mancherial', ' Bhadrachalam', ' Kothagudem', ' Warangal'],
      },
      {
        name: 'Jogulamba Gadwal',
        cities: ['Gadwal', ' Alampur', ' Ieeja', ' Ghattu', ' Maldakal'],
      },
      {
        name: 'Kamareddy',
        cities: ['Kamareddy', ' Bodhan', ' Banswada', ' Yellareddy', ' Birkur'],
      },
      {
        name: 'Karimnagar',
        cities: ['Karimnagar', ' Jagtial', ' Mancherial', ' Sircilla', ' Metpalli'],
      },
      {
        name: 'Khammam',
        cities: ['Khammam', ' Kothagudem', ' Bhadrachalam', ' Paloncha', ' Yellandu'],
      },
      {
        name: 'Kumuram Bheem Asifabad',
        cities: ['Asifabad', ' Kagaznagar', ' Sirpur', ' Bejjur', ' Wankdi'],
      },
      {
        name: 'Mahabubabad',
        cities: ['Mahabubabad', ' Thorrur', ' Narsampet', ' Maripeda', ' Dornakal'],
      },
      {
        name: 'Mahabubnagar',
        cities: ['Mahabubnagar', ' Gadwal', ' Wanaparthy', ' Narayanpet', ' Jadcherla'],
      },
      {
        name: 'Medak',
        cities: ['Medak', ' Siddipet', ' Sangareddy', ' Narasapur', ' Narsapur'],
      },
      {
        name: 'Medchal Malkajgiri',
        cities: ['Medchal', ' Malkajgiri', ' Keesara', ' Ghatkesar', ' Qutbullapur'],
      },
      {
        name: 'Nagarkurnool',
        cities: ['Nagarkurnool', ' Wanaparthy', ' Gadwal', ' Achampet', ' Kollapur'],
      },
      {
        name: 'Nalgonda',
        cities: ['Nalgonda', ' Suryapet', ' Huzurnagar', ' Miryalaguda', ' Narketpally'],
      },
      {
        name: 'Nirmal',
        cities: ['Nirmal', ' Khanapur', ' Kaddam', ' Narsapur', ' Lakshmanchanda'],
      },
      {
        name: 'Nizamabad',
        cities: ['Nizamabad', ' Armoor', ' Bodhan', ' Kamareddy', ' Bheemgal'],
      },
      {
        name: 'Peddapalli',
        cities: ['Peddapalli', ' Mancherial', ' Kothagudem', ' Ramagundam', ' Peddapalli'],
      },
      {
        name: 'Rajanna Sircilla',
        cities: ['Sircilla', ' Vemulawada', ' Bojjapally', ' Gambhirpur', ' Venkatraopet'],
      },
      {
        name: 'Rangareddy',
        cities: ['Rangareddy', ' Medak', ' Sangareddy', ' Zahirabad', ' Narsapur'],
      },
      {
        name: 'Sangareddy',
        cities: ['Sangareddy', ' Medak', ' Siddipet', ' Narasapur', ' Patancheru'],
      },
      {
        name: 'Siddipet',
        cities: ['Siddipet', ' Gajwel', ' Dubbak', ' Prashanthnagar', ' Thogutta'],
      },
      {
        name: 'Suryapet',
        cities: ['Suryapet', ' Kodad', ' Huzurnagar', ' Nalgonda', ' Miryalaguda'],
      },
      {
        name: 'Vikarabad',
        cities: ['Vikarabad', ' Tandur', ' Basheerabad', ' Pargi', ' Doma'],
      },
      {
        name: 'Warangal Rural',
        cities: ['Warangal', ' Parkal', ' Chennur', ' Narsampet', ' Sangam'],
      },
      {
        name: 'Warangal Urban',
        cities: ['Warangal', ' Warangal', ' Kazipet', ' Jangaon', ' Gadwal'],
      },
      {
        name: 'Yadadri Bhuvanagiri',
        cities: ['Yadadri', ' Bhongir', ' Bibinagar', ' Alair', ' Pochampally'],
      },
    ],
  },
  {
    name: 'Tripura',
    districts: [
      {
        name: 'Dhalai',
        cities: ['Ambassa', ' Dhalai', ' Khowai', ' Kamalpur', ' Gandacherra'],
      },
      {
        name: 'Gomati',
        cities: ['Udaipur', ' Gomati', ' Amarpur', ' Killa', ' Ompi'],
      },
      {
        name: 'Khowai',
        cities: ['Khowai', ' Khowai', ' Teliamura', ' Tularam', ' Krityanand'],
      },
      {
        name: 'North Tripura',
        cities: ['Dharmanagar', ' North Tripura', ' Kanchanpur', ' Laljuri', ' Jampui'],
      },
      {
        name: 'Sepahijala',
        cities: ['Sepahijala', ' Bishalgarh', ' Jirania', ' Sonamura', ' Kathalia'],
      },
      {
        name: 'South Tripura',
        cities: ['Udaipur', ' South Tripura', ' Belonia', ' Sabroom', ' Rajnagar'],
      },
      {
        name: 'Unakoti',
        cities: ['Unakoti', ' Kailasahar', ' Kumarghat', ' Panisagar', ' Dharmanagar'],
      },
      {
        name: 'West Tripura',
        cities: ['Agartala', ' West Tripura', ' Mohanpur', ' Bishalgarh', ' Jirania'],
      },
    ],
  },
  {
    name: 'Uttar Pradesh',
    districts: [
      {
        name: 'Agra',
        cities: ['Agra', ' Fatehpur Sikri', ' Kiraoli', ' Kheragarh', ' Etmadpur'],
      },
      {
        name: 'Aligarh',
        cities: ['Aligarh', ' Atrauli', ' Gabhana', ' Gangiri', ' Iglas', ' Khair'],
      },
      {
        name: 'Ambedkar Nagar',
        cities: ['Akbarpur', ' Alapur', ' Ambedkar Nagar', ' Bhiti', ' Jalalpur', ' Tanda'],
      },
      {
        name: 'Amethi',
        cities: ['Amethi', ' Gauriganj', ' Musafirkhana', ' Salon', ' Tiloi'],
      },
      {
        name: 'Amroha',
        cities: ['Amroha', ' Dhanaura', ' Hasanpur', ' Gajraula', ' Joya'],
      },
      {
        name: 'Auraiya',
        cities: ['Auraiya', ' Dibiyapur', ' Ajitmal', ' Sahswan', ' Bhagatpur'],
      },
      {
        name: 'Azamgarh',
        cities: ['Azamgarh', ' Mau', ' Nizamabad', ' Madhuban', ' Sagri'],
      },
      {
        name: 'Baghpat',
        cities: ['Baghpat', ' Khekra', ' Binauli', ' Jalalabad', ' Chaproli'],
      },
      {
        name: 'Bahraich',
        cities: ['Bahraich', ' Kaiserganj', ' Mihinpurwa', ' Nanpara', ' Fakharpur'],
      },
      {
        name: 'Ballia',
        cities: ['Ballia', ' Bansdih', ' Rasra', ' Bairia', ' Revti'],
      },
      {
        name: 'Balrampur',
        cities: ['Balrampur', ' Tulsipur', ' Utraula', ' Gaindas Bujurg', ' Paidih'],
      },
      {
        name: 'Banda',
        cities: ['Banda', ' Kalinagar', ' Naraini', ' Atarra', ' Baberu'],
      },
      {
        name: 'Barabanki',
        cities: ['Barabanki', ' Fatehpur', ' Ramnagar', ' Rampur Karkhana', ' Haidergarh'],
      },
      {
        name: 'Bareilly',
        cities: ['Bareilly', ' Nawabganj', ' Aonla', ' Faridpur', ' Bithrichain'],
      },
      {
        name: 'Basti',
        cities: ['Basti', ' Harraiya', ' Kaptanganj', ' Rudhauli', ' Parasrampur'],
      },
      {
        name: 'Bijnor',
        cities: ['Bijnor', ' Najibabad', ' Chandpur', ' Bijnor', ' Nagina'],
      },
      {
        name: 'Budaun',
        cities: ['Bilsi', ' Bisauli', ' Budaun', ' Dataganj', ' Sahaswan', ' Ujhani'],
      },
      {
        name: 'Bulandshahr',
        cities: ['Bulandshahr', ' Khurja', ' Sikandarpur', ' Shikarpur', ' Jewar'],
      },
      {
        name: 'Chandauli',
        cities: ['Chakia', ' Chandauli', ' Mughalsarai', ' Naugarh', ' Sakaldiha'],
      },
      {
        name: 'Chandausi',
        cities: ['Chandausi', ' Rampur', ' Bilari', ' Kundarki', ' Chamraua'],
      },
      {
        name: 'Chitrakoot',
        cities: ['Chitrakoot', ' Karwi', ' Manikpur', ' Rajapur', ' Pahari'],
      },
      {
        name: 'Deoria',
        cities: ['Deoria', ' Rudrapur', ' Bhatpar Rani', ' Pathardeva', ' Bankata'],
      },
      {
        name: 'Etah',
        cities: ['Etah', ' Kasganj', ' Aliganj', ' Nidhauli Kall', ' Sahawar'],
      },
      {
        name: 'Etawah',
        cities: ['Etawah', ' Bakewar', ' Bidhuna', ' Chakarnagar', ' Saifai'],
      },
      {
        name: 'Faizabad',
        cities: ['Faizabad', ' Sohawal', ' Milkipur', ' Bikapur', ' Rudauli'],
      },
      {
        name: 'Farrukhabad',
        cities: ['Farrukhabad', ' Kaimganj', ' Aliganj', ' Shamsabad', ' Mohammabad'],
      },
      {
        name: 'Fatehpur',
        cities: ['Fatehpur', ' Khaga', ' Koraon', ' Ajayabhata', ' Bahua'],
      },
      {
        name: 'Firozabad',
        cities: ['Firozabad', ' Jasrana', ' Shikohabad', ' Tundla', ' Araon'],
      },
      {
        name: 'Gautam Buddha Nagar',
        cities: ['Greater Noida', ' Noida', ' Dadri', ' Jewar', ' Bisrakh'],
      },
      {
        name: 'Ghaziabad',
        cities: ['Garhmukteshwar', ' Ghaziabad', ' Hapur', ' Loni', ' Modinagar', ' Pilakhua'],
      },
      {
        name: 'Ghazipur',
        cities: ['Ghazipur', ' Zamania', ' Mohammadabad', ' Saidpur', ' Jakhania'],
      },
      {
        name: 'Gonda',
        cities: ['Gonda', ' Colonelganj', ' Utraula', ' Tarabganj', ' Paraspur'],
      },
      {
        name: 'Gorakhpur',
        cities: ['Gorakhpur', ' Bansgaon', ' Khajani', ' Sardarnagar', ' Chargawan'],
      },
      {
        name: 'Greater Noida',
        cities: ['Greater Noida', ' Noida', ' Dadri', ' Jewar', ' Bisrakh'],
      },
      {
        name: 'Hamirpur',
        cities: ['Hamirpur', ' Kulpahar', ' Maudaha', ' Rath', ' Sarila', ' Sumerpur'],
      },
      {
        name: 'Hardoi',
        cities: ['Hardoi', ' Shahabad', ' Bilgram', ' Sandila', ' Mallawan'],
      },
      {
        name: 'Hapur',
        cities: ['Hapur', ' Garhmukteshwar', ' Pilakhua', ' Simri', ' Dhanaura'],
      },
      {
        name: 'Hardoi',
        cities: ['Hardoi', ' Shahabad', ' Bilgram', ' Sandila', ' Mallawan'],
      },
      {
        name: 'Hathras',
        cities: ['Hathras', ' Sadabad', ' Sikandra Rao', ' Purdilnagar', ' Gopiganj'],
      },
      {
        name: 'Jalaun',
        cities: ['Orai', ' Jalaun', ' Konch', ' Kalpi', ' Madhogarh'],
      },
      {
        name: 'Jaunpur',
        cities: ['Jaunpur', ' Machhlishahr', ' Badlapur', ' Shahganj', ' Kerakat'],
      },
      {
        name: 'Jhansi',
        cities: ['Jhansi', ' Gwalior', ' Moth', ' Babina', ' Chirgaon'],
      },
      {
        name: 'Kanauj',
        cities: ['Kanauj', ' Chhibramau', ' Sarsaul', ' Bilgram', ' Araniya'],
      },
      {
        name: 'Kannauj',
        cities: ['Kannauj', ' Chhibramau', ' Sarsaul', ' Bilgram', ' Araniya'],
      },
      {
        name: 'Kanpur Dehat',
        cities: ['Akbarpur', ' Derapur', ' Shivrpur', ' Maitha', ' Roshnabad'],
      },
      {
        name: 'Kanpur Nagar',
        cities: ['Kanpur', ' Sarsol', ' Bhitargaon', ' Narwal', ' Kalianpur'],
      },
      {
        name: 'Kasganj',
        cities: ['Ganj Dundwara', ' Kasganj', ' Patiyali', ' Sahawar', ' Soron'],
      },
      {
        name: 'Kashipur',
        cities: ['Kashipur', ' Jaspur', ' Bajpur', ' Gadarpur', ' Sitarganj'],
      },
      {
        name: 'Kaushambi',
        cities: ['Manjhanpur', ' Chail', ' Kara', ' Sarsawan', ' Muratganj'],
      },
      {
        name: 'Kushinagar',
        cities: ['Barawa', ' Hata', ' Kasia', ' Padrauna', ' Ramkola', ' Tamkuhir'],
      },
      {
        name: 'Lakhimpur Kheri',
        cities: ['Behta', ' Gola Gokarnath', ' Lakhimpur', ' Mailani', ' Nakaha', ' Paliya'],
      },
      {
        name: 'Lalitpur',
        cities: ['Lalitpur', ' Talbehat', ' Mahroni', ' Birdhpur', ' Parahra'],
      },
      {
        name: 'Lucknow',
        cities: ['Lucknow', ' Bakshi Ka Talab', ' Malihabad', ' Kakori', ' Mohanlalganj'],
      },
      {
        name: 'Maharajganj',
        cities: ['Maharajganj', ' Nichlaul', ' Phulpur', ' Siswa', ' Mintapur'],
      },
      {
        name: 'Mahoba',
        cities: ['Mahoba', ' Charkhari', ' Kabrai', ' Sarila', ' Rampur'],
      },
      {
        name: 'Mainpuri',
        cities: ['Mainpuri', ' Bhongaon', ' Kishni', ' Kurawali', ' Alguni'],
      },
      {
        name: 'Mathura',
        cities: ['Mathura', ' Vrindavan', ' Goverdhan', ' Chhata', ' Mahavan'],
      },
      {
        name: 'Mau',
        cities: ['Mau', ' Ghosi', ' Maunath Bhanjan', ' Muhammadabad', ' Ratanpura'],
      },
      {
        name: 'Meerut',
        cities: ['Meerut', ' Mawana', ' Hastinapur', ' Parikshitgarh', ' Daurala'],
      },
      {
        name: 'Mirzapur',
        cities: ['Mirzapur', ' Chunar', ' Robertsganj', ' Dudhi', ' Ohani'],
      },
      {
        name: 'Moradabad',
        cities: ['Moradabad', ' Thakurdwara', ' Kundarki', ' Bilari', ' Baniyakuri'],
      },
      {
        name: 'Muzaffarnagar',
        cities: ['Muzaffarnagar', ' Jansath', ' Budhana', ' Khatauli', ' Baghra'],
      },
      {
        name: 'Pilibhit',
        cities: ['Pilibhit', ' Puranpur', ' Barkhera', ' Bilsanda', ' Amaria'],
      },
      {
        name: 'Pratapgarh',
        cities: ['Pratapgarh', ' Patti', ' Kunda', ' Patti Bhaisa', ' Babaganj'],
      },
      {
        name: 'Prayagraj',
        cities: ['Allahabad', ' Handia', ' Meja', ' Phulpur', ' Prayagraj'],
      },
      {
        name: 'Rae Bareli',
        cities: ['Rae Bareli', ' Salon', ' Dalmau', ' Harchandpur', ' Unchahar'],
      },
      {
        name: 'Rampur',
        cities: ['Rampur', ' Tanda', ' Shahabad', ' Milak', ' Azamgarh'],
      },
      {
        name: 'Rae Bareli',
        cities: ['Rae Bareli', ' Salon', ' Dalmau', ' Harchandpur', ' Unchahar'],
      },
      {
        name: 'Saharanpur',
        cities: ['Saharanpur', ' Behat', ' Nakur', ' Gangoh', ' Rampur Maniharan'],
      },
      {
        name: 'Sambhal',
        cities: ['Sambhal', ' Chandausi', ' Asmoli', ' Bahjoi', ' Rajpura'],
      },
      {
        name: 'Sant Kabir Nagar',
        cities: ['Khalilabad', ' Basti', ' Hangpur', ' Mehdawal', ' Baghauli'],
      },
      {
        name: 'Sant Ravidas Nagar',
        cities: ['Gyanpur', ' Bhadohi', ' Aurai', ' Deoria', ' Gyanpur'],
      },
      {
        name: 'Shahjahanpur',
        cities: ['Jalalabad', ' Kalan', ' Powayan', ' Shahjahanpur', ' Tilhar'],
      },
      {
        name: 'Shamli',
        cities: ['Kairana', ' Shamli', ' Thana Bhawan', ' Unn'],
      },
      {
        name: 'Siddharthnagar',
        cities: ['Navgarh', ' Domariyaganj', ' Itwa', ' Bansi', ' Khesraha'],
      },
      {
        name: 'Sitapur',
        cities: ['Sitapur', ' Biswan', ' Sidhauli', ' Laharpur', ' Maholi'],
      },
      {
        name: 'Sonbhadra',
        cities: ['Robertsganj', ' Anpara', ' Renukoot', ' Dudhi', ' Obra'],
      },
      {
        name: 'Sultanpur',
        cities: ['Sultanpur', ' Amethi', ' Kadipur', ' Kadi', ' Jais'],
      },
      {
        name: 'Unnao',
        cities: ['Unnao', ' Purwa', ' Bangarmau', ' Hasanganj', ' Safipur'],
      },
      {
        name: 'Varanasi',
        cities: ['Varanasi', ' Pindra', ' Gangapur', ' Kashi', ' Shivpur'],
      },
    ],
  },
  {
    name: 'Uttarakhand',
    districts: [
      {
        name: 'Almora',
        cities: ['Almora', ' Ranikhet', ' Dwarahat', ' Bageshwar', ' Chamoli'],
      },
      {
        name: 'Bageshwar',
        cities: ['Bageshwar', ' Kapkot', ' Garur', ' Sult', ' Bogdiwar'],
      },
      {
        name: 'Chamoli',
        cities: ['Chamoli', ' Joshimath', ' Karnaprayag', ' Gopeshwar', ' Ranikhet'],
      },
      {
        name: 'Champawat',
        cities: ['Champawat', ' Lohaghat', ' Tanakpur', ' Pati', ' Barakot'],
      },
      {
        name: 'Dehradun',
        cities: ['Dehradun', ' Rishikesh', ' Haridwar', ' Vikasnagar', ' Chakrata'],
      },
      {
        name: 'Haridwar',
        cities: ['Haridwar', ' Roorkee', ' Laksar', ' Khanpur', ' Bhagwanpur'],
      },
      {
        name: 'Nainital',
        cities: ['Nainital', ' Haldwani', ' Kaladhungi', ' Ramnagar', ' Dhari'],
      },
      {
        name: 'Pauri Garhwal',
        cities: ['Pauri', ' Kotdwar', ' Lansdowne', ' Thailisain', ' Riknik'],
      },
      {
        name: 'Pithoragarh',
        cities: ['Pithoragarh', ' Dharchula', ' Didihat', ' Munsyari', ' Berinag'],
      },
      {
        name: 'Rudraprayag',
        cities: ['Rudraprayag', ' Ukhimath', ' Gopeshwar', ' Augustmuni', ' Kunda'],
      },
      {
        name: 'Tehri Garhwal',
        cities: ['Tehri', ' Devprayag', ' Narendranagar', ' Kanakrashi', ' Chamba'],
      },
      {
        name: 'Udham Singh Nagar',
        cities: ['Rudrapur', ' Kashipur', ' Sitarganj', ' Khatima', ' Gadarpur'],
      },
      {
        name: 'Uttarkashi',
        cities: ['Uttarkashi', ' Barkot', ' Naugaon', ' Rajgarhi', ' Chinyalisaur'],
      },
    ],
  },
  {
    name: 'West Bengal',
    districts: [
      {
        name: 'Alipurduar',
        cities: ['Alipurduar', ' Falakata', ' Kumargram', ' Madarihat', ' Tufanganj'],
      },
      {
        name: 'Bankura',
        cities: ['Bankura', ' Bishnupur', ' Sonamukhi', ' Raiganj', ' Baleshwar'],
      },
      {
        name: 'Birbhum',
        cities: ['Birbhum', ' Suri', ' Rampurhat', ' Bolpur', ' Nanoor'],
      },
      {
        name: 'Cooch Behar',
        cities: ['Cooch Behar', ' Dinhata', ' Tufanganj', ' Mathabhanga', ' Cooch Behar'],
      },
      {
        name: 'Dakshin Dinajpur',
        cities: ['Balurghat', ' Gangarampur', ' Harirampur', ' Kushmandi', ' Kumarganj'],
      },
      {
        name: 'Darjeeling',
        cities: ['Darjeeling', ' Kalimpong', ' Kurseong', ' Siliguri', ' Mirik'],
      },
      {
        name: 'East Midnapore',
        cities: ['Kolkata', ' Kanthi', ' Tamluk', ' Haldia', ' Contai'],
      },
      {
        name: 'Hooghly',
        cities: ['Hooghly', ' Chinsurah', ' Serampore', ' Chandannagar', ' Arambag'],
      },
      {
        name: 'Howrah',
        cities: ['Howrah', ' Bally', ' Uluberia', ' Shyampukur', ' Jagatballavpur'],
      },
      {
        name: 'Jalpaiguri',
        cities: ['Jalpaiguri', ' Malbazar', ' Dhupguri', ' Rajganj', ' Maynaguri'],
      },
      {
        name: 'Jhargram',
        cities: ['Jhargram', ' Gopiballavpur', ' Jamboni', ' Sankrail', ' Binpur'],
      },
      {
        name: 'Kalimpong',
        cities: ['Kalimpong', ' Lava', ' Pedong', ' Gorubathan', ' Jaldhaka'],
      },
      {
        name: 'Kolkata',
        cities: ['Kolkata', ' North Kolkata', ' South Kolkata', ' East Kolkata', ' Howrah'],
      },
      {
        name: 'Maldah',
        cities: ['Maldah', ' English Bazar', ' Manikchak', ' Kaliachak', ' Chanchal'],
      },
      {
        name: 'Murshidabad',
        cities: ['Murshidabad', ' Baharampur', ' Berhampore', ' Kandi', ' Domkal'],
      },
      {
        name: 'Nadia',
        cities: ['Nadia', ' Krishnanagar', ' Berhampore', ' Ranaghat', ' Baharampur'],
      },
      {
        name: 'North 24 Parganas',
        cities: ['North 24 Parganas', ' Barasat', ' Habra', ' Barrackpore', ' Bongaon'],
      },
      {
        name: 'North Dinajpur',
        cities: ['Raiganj', ' Islampur', ' Kaliaganj', ' Karandighi', ' Hemtabad'],
      },
      {
        name: 'Paschim Bardhaman',
        cities: ['Asansol', ' Durgapur', ' Raniganj', ' Kulti', ' Andal'],
      },
      {
        name: 'Paschim Medinipur',
        cities: ['Midnapore', ' Kharagpur', ' Jhargram', ' Ghatal', ' Dantan'],
      },
      {
        name: 'Purulia',
        cities: ['Purulia', ' Raghunathpur', ' Jhalda', ' Manbazar', ' Balarampur'],
      },
      {
        name: 'South 24 Parganas',
        cities: ['South 24 Parganas', ' Diamond Harbour', ' Kakdwip', ' Canning', ' Basirhat'],
      },
      {
        name: 'South Dinajpur',
        cities: ['Balurghat', ' Gangarampur', ' Harirampur', ' Kushmandi', ' Kumarganj'],
      },
      {
        name: 'Uttar Dinajpur',
        cities: ['Raiganj', ' Islampur', ' Kaliaganj', ' Karandighi', ' Hemtabad'],
      },
      {
        name: 'West Midnapore',
        cities: ['West Midnapore', ' Medinipur', ' Kharagpur', ' Jhargram', ' Ghatal'],
      },
    ],
  },
];

// Helper function to get all states
export const getAllStates = (): string[] => {
  return indianStates.map(state => state.name).sort();
};

// Helper function to get districts for a state
export const getDistrictsForState = (stateName: string): string[] => {
  const state = indianStates.find(state => state.name === stateName);
  return state ? state.districts.map(district => district.name).sort() : [];
};

// Helper function to get cities for a district
export const getCitiesForDistrict = (stateName: string, districtName: string): string[] => {
  const state = indianStates.find(state => state.name === stateName);
  if (!state) return [];

  const district = state.districts.find(district => district.name === districtName);
  return district ? district.cities.sort() : [];
};

// Helper function to search states
export const searchStates = (query: string): string[] => {
  if (!query.trim()) return getAllStates();

  const lowercaseQuery = query.toLowerCase();
  return indianStates
    .filter(state => state.name.toLowerCase().includes(lowercaseQuery))
    .map(state => state.name)
    .sort();
};

// Helper function to search districts within a state
export const searchDistrictsInState = (stateName: string, query: string): string[] => {
  const districts = getDistrictsForState(stateName);
  if (!query.trim()) return districts;

  const lowercaseQuery = query.toLowerCase();
  return districts
    .filter(district => district.toLowerCase().includes(lowercaseQuery))
    .sort();
};

// Helper function to search cities within a district
export const searchCitiesInDistrict = (stateName: string, districtName: string, query: string): string[] => {
  const cities = getCitiesForDistrict(stateName, districtName);
  if (!query.trim()) return cities;

  const lowercaseQuery = query.toLowerCase();
  return cities
    .filter(city => city.toLowerCase().includes(lowercaseQuery))
    .sort();
};

// Helper function to get combined list of cities and districts for a state
export const getCitiesAndDistrictsForState = (stateName: string): string[] => {
  const state = indianStates.find(state => state.name === stateName);
  if (!state) return [];

  const combinedList: string[] = [];

  // Add all districts
  state.districts.forEach(district => {
    combinedList.push(district.name);
  });

  // Add all cities from all districts
  state.districts.forEach(district => {
    district.cities.forEach(city => {
      combinedList.push(city);
    });
  });

  return [...new Set(combinedList)].sort();
};

// Helper function to search combined cities and districts within a state
export const searchCitiesAndDistrictsInState = (stateName: string, query: string): string[] => {
  const combinedList = getCitiesAndDistrictsForState(stateName);
  if (!query.trim()) return combinedList;

  const lowercaseQuery = query.toLowerCase();
  return combinedList
    .filter(item => item.toLowerCase().includes(lowercaseQuery))
    .sort();
};