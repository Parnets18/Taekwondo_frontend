import { FaCheckCircle, FaHandshake, FaShieldAlt, FaMountain, FaBalanceScale, FaFistRaised } from 'react-icons/fa';

function ClubRules() {
  const tenets = [
    {
      title: "Courtesy (Ye Ui)",
      description: "To be polite and respectful to others. Courtesy is the foundation of human relationships and helps create a harmonious society.",
      icon: FaHandshake
    },
    {
      title: "Integrity (Yom Chi)",
      description: "To be honest and have strong moral principles. A person of integrity knows the difference between right and wrong and always chooses the right path.",
      icon: FaShieldAlt
    },
    {
      title: "Perseverance (In Nae)",
      description: "To continue in a course of action despite difficulty or opposition. Success comes to those who persist and never give up.",
      icon: FaMountain
    },
    {
      title: "Self-Control (Guk Gi)",
      description: "To have control over one's emotions, desires, and actions. Self-control is essential for maintaining discipline and achieving goals.",
      icon: FaBalanceScale
    },
    {
      title: "Indomitable Spirit (Baekjul Boolgool)",
      description: "To have a spirit that cannot be broken or conquered. Face challenges with courage and determination, never surrendering to adversity.",
      icon: FaFistRaised
    }
  ];

  const rules = [
    "Interaction of your ward in classes increases the tenets of Taekwon-Do i.e., Courtesy, Integrity, Perseverance, self-control, Indomitable Spirit towards society.",
    "Instructor shall train the ward both physically and mentally.",
    "Self-discipline, mental discipline, better school grades shall be assured to your ward if she/he is regular. Parents should meet the instructor once in a month to know their ward's progress. (Health, education, behaviour etc.,)",
    "Instructor's action can be directly reported to the Association if in case of any problem.",
    "Instructor or the Association will not be responsible for the misuse of techniques by your ward in the class premises or outside the premises.",
    "In case of physical hurt during the class, first aid shall be provided. Other medical expenses to be bourne by the parents.",
    "Be punctual to the class. Compulsorily wear Taekwon-Do Uniform (Dobok) during all training sessions.",
    "To maintain utmost discipline during training and at all times to adhere to the oath undertaken. Bind your belt before entering the Dojang. Use the correct knot.",
    "Once the student is in uniform with belt, he/she must wear shoes only and be barefoot while entering dojang. Do not wear watches or accessories during the class, pay attention to hygiene, especially shorten your toe and fingernails.",
    "Pay attention to the orders of your instructor, do not talk or laugh aloud during training sessions/class. Maintain silence while sitting (sit down firmly on the ground, do not lean on the wall).",
    "Not to eat, drink or smoke inside the Dojang. Respect Trainers/ Instructors, Seniors, peers and partners. Be courteous and helpful.",
    "The Association and/or its governing body reserves the right to select any student(s) for further Belt gruding, participation in any participation in any Tournaments (Regional, Zonal, National, International and World meets), Higher Training, Seminars etc.",
    "To Bow on entering and leaving the Dojang.",
    "Due to compelling reasons, if unable to attend the classes, to duly inform their respective instructor(s) in advance.",
    "To wear a white and clean Dobok, without patches and letterin.",
    "While in Indoor Dojang, not to open or close windows without permission of the Trainer/Instructor.",
    "Not to leave the Dojang during class without permission of your Trainer/Instructor.",
    "Not to practice free sparing without Trainer's permission.",
    "Monthly Fees to be paid on time irrespective of the number of classes attended by the student, if he/she wishes to continue in the club.",
    "Admission fee will not be refunded. Admission charges are charged only once. in case of discontinuity of the ward, he/she is entitled to pay a month's fee. Re-admission charges are as applicable, if the ward wishes to re-join within six months of discontinuity no admissions are applicable.",
    "Pay Training Fees on or before 10th of each calendar month. Delay in fee attracts fine.",
    "Every year monthly fees shall be hiked as per the association norms.",
    "Admission fees include Dobok (uniform) charges. It is compulsory to wear uniform once you receive it.",
    "Fee is inclusive of all Association charges and no extra shall be charged without prior notice. In case of change in regular fee structure it shall be intimated before a month. Fees do not include Belt Examination charges.",
    "Belt exams are held once in every 4-5 months (time taken to complete Black Belt exam is 4 ½ to 5 years). Belt exam shall be intimated well before as per the Association norms. Examination charges include exam fee, examiner's fee as per the Belt Grade.",
    "Weekly two classes shall be held even if there is one absence from the instructor. Duration of classes may slightly vary sometimes as our motto is to complete a goal on a given day.",
    "In case of any tournament the instructor shall take extra classes with prior notice without any charges."
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
          <img 
            src="/combat-warrior-logo.png" 
            alt="Combat Warrior Logo" 
            className="w-20 h-20 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            COMBAT WARRIOR TAEKWON-DO ASSOCIATION OF KARNATAKA
          </h1>
          <h2 className="text-xl font-semibold text-amber-600">
            CLUB RULES AND REGULATIONS
          </h2>
        </div>

        {/* Five Tenets */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <h3 className="text-2xl font-bold text-center text-amber-600 mb-6">
            The Five Tenets of Taekwon-Do
          </h3>
          <div className="space-y-6">
            {tenets.map((tenet, index) => {
              const IconComponent = tenet.icon;
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <IconComponent className="w-12 h-12 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      {tenet.title}
                    </h4>
                    <p className="text-gray-700 text-justify">
                      {tenet.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <ol className="space-y-4">
            {rules.map((rule, index) => (
              <li key={index} className="flex items-start">
                <span className="font-bold text-amber-600 mr-3 flex-shrink-0">
                  {index + 1}.
                </span>
                <p className="text-gray-700 text-justify">
                  {rule}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6 text-center">
          <p className="text-gray-600 mb-3">For any queries, please contact:</p>
          <div className="text-gray-700">
            <p>📞 +91 7259113288</p>
            <p>✉️ yesh18390@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClubRules;
