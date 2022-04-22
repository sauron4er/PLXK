const directors = [
  // id's 1-4
  {
    id: '1',
    data: {name: 'Генеральний директор', seat_id: 16},
    type: 'chiefSeatNode',
    position: {x: 720, y: 20}
  },
  {id: 'e1-2', source: '1', target: '2', type: 'step', style: { stroke: 'black' }},
  {
    id: '2',
    data: {name: 'Директор з виробництва', seat_id: 41},
    type: 'chiefSeatNode',
    position: {x: 20, y: 120}
  },
  {id: 'e1-3', source: '1', target: '3', type: 'step'},
  {
    id: '3',
    data: {name: 'Головний інженер', seat_id: 17},
    type: 'chiefSeatNode',
    position: {x: 580, y: 120}
  },
  {id: 'e1-4', source: '1', target: '4', type: 'step'},
  {
    id: '4',
    data: {name: 'Директор з якості та екології', seat_id: 42},
    type: 'chiefSeatNode',
    position: {x: 860, y: 120}
  }
];

const gen_dir_departments = [
  // id's 5-8
  {id: 'e1-5', source: '1', target: '5', type: 'step'},
  {
    id: '5',
    data: [
      {
        name: 'Відділ розвитку виробництва',
        seats: [
          {seat_id: 229, name: 'Начальник відділу розвитку виробництва'},
          {seat_id: 241, name: 'Головний технолог'},
          {seat_id: 239, name: 'Головний хімік'}
        ]
      },

      {
        name: 'Юридично-адміністративний відділ',
        seats: [
          {seat_id: 47, name: 'Начальник юридично-адміністративного відділу'},
          {seat_id: 48, name: 'Юрисконсульт'},
          {seat_id: 49, name: 'Секретар керівника'}
        ]
      },
      {
        name: 'Відділ кадрів',
        seats: [
          {seat_id: 13, name: 'Начальник відділу кадрів'},
          {seat_id: 12, name: 'Інспектор з кадрів'}
        ]
      },
      {
        name: 'Бухгалтерія',
        seats: [
          {seat_id: 21, name: 'Головний бухгалтер'},
          {seat_id: 43, name: 'Заступник головного бухгалтера'},
          {seat_id: 44, name: 'Бухгалтер'},
          {seat_id: 46, name: 'Бухгалтер-обліковець'},
          {seat_id: 45, name: 'Касир'}
        ]
      },
      {
        name: 'Відділ інформаційних технологій',
        seats: [
          {seat_id: 4, name: 'Начальник відділу інформаційних технологій'},
          {seat_id: 6, name: 'Інженер-програміст'},
          {seat_id: 5, name: 'Адміністратор системи'}
        ]
      },
      {
        name: 'Відділ митних операцій',
        seats: [
          {seat_id: 50, name: 'Начальник відділу митних операцій'},
          {seat_id: 51, name: 'Брокер'}
        ]
      }
    ],
    type: 'departmentNode',
    position: {x: 1140, y: 120}
  },
  {id: 'e1-6', source: '1', target: '6', type: 'step'},
  {
    id: '6',
    data: [
      {
        name: 'Планово-економічний відділ',
        seats: [
          {seat_id: 235, name: 'Начальник планово-економічного відділу'},
          {seat_id: 52, name: 'Економіст'}
        ]
      },
      {
        name: 'Відділ матеріально-технічного забезпечення',
        seats: [
          {seat_id: 53, name: 'Начальник відділу матеріально-технічного забезпечення'},
          {seat_id: 54, name: 'Менеджер з постачання ВМТЗ'}
        ]
      },
      {
        name: 'Відділ приймання сировини',
        seats: [{seat_id: 236, name: 'Начальник відділу приймання сировини'}]
      },
      {
        name: 'Служба охорони праці',
        seats: [{seat_id: 92, name: 'Начальник служби охорони праці та екології'}]
      },
      {
        name: 'Пожежна охорона',
        seats: [
          {seat_id: 91, name: 'Начальник пожежної охорони'},
          {seat_id: 190, name: 'Фахівець з цивільної оборони'},
          {seat_id: 191, name: 'Пожежний'},
          {seat_id: 189, name: 'Водій автомобільного засобу (аварійно-рятувального)'}
        ]
      }
    ],
    type: 'departmentNode',
    position: {x: 1420, y: 120}
  },
  {id: 'e1-7', source: '1', target: '7', type: 'step'},
  {
    id: '7',
    data: [
      {
        name: 'Господарська дільниця',
        seats: [{seat_id: 98, name: 'Начальник господарської дільниці'}]
      }
    ],
    type: 'departmentNode',
    position: {x: 1700, y: 120}
  },
  {id: 'e7-8', source: '7', target: '8', type: 'step'},
  {
    id: '8',
    data: [
      {
        name: 'Медпункт',
        seats: [{seat_id: 99, name: 'Медична сестра'}]
      }
    ],
    type: 'departmentNode',
    position: {x: 1720, y: 220}
  }
];

const production_dir_departments = [
  // id's 9-15
  {id: 'e2-9', source: '2', target: '9', type: 'step'},
  {
    id: '9',
    data: [
      {
        name: 'Центральний склад',
        seats: [
          {seat_id: 73, name: 'Начальник центрального складу'},
          {seat_id: 55, name: 'Завідувач складу товарно-матеріальних цінностей'}
        ]
      },
      {
        name: 'Лісна біржа',
        seats: [
          {seat_id: 70, name: 'Начальник лісної біржі'},
          {seat_id: 71, name: 'Майстер лісної біржі'}
        ]
      },
      {
        name: 'Дільниця залізничного транспорту',
        seats: [
          {seat_id: 124, name: 'Начальник дільниці залізничного транспорту'},
          {seat_id: 101, name: 'Майстер дільниці залізничного транспорту'}
        ]
      },
      {
        name: 'Цех №1 (виробництво КФС)',
        seats: [
          {seat_id: 58, name: 'Начальник цеху № 1'},
          {seat_id: 60, name: 'Інженер-технолог цеху № 1'}
        ]
      }
    ],
    type: 'departmentNode',
    position: {x: 15, y: 180}
  },
  {id: 'e9-10', source: '9', target: '10', type: 'step'},
  {
    id: '10',
    data: [
      {
        name: 'Цех №2 (виробництво етилацетату)',
        seats: [
          {seat_id: 59, name: 'Начальник цеху № 2'},
          {seat_id: 64, name: 'Інженер-технолог цеху № 2'}
        ]
      }
    ],
    type: 'departmentNode',
    position: {x: 15, y: 500}
  },
  {id: 'e10-11', source: '10', target: '11', type: 'step'},
  {
    id: '11',
    data: [
      {
        name: 'Склад легкозаймистих речовин',
        seats: []
      }
    ],
    type: 'departmentNode',
    position: {x: 295, y: 500}
  },
  {id: 'e10-12', source: '10', target: '12', type: 'step'},
  {
    id: '12',
    data: [
      {
        name: 'Цех № 3 (виробництво деревновугільної продукції)',
        seats: [
          {seat_id: 215, name: 'Начальник цеху № 3'},
          {seat_id: 61, name: 'Головний технолог цеху № 3'},
          {seat_id: 139, name: 'Інженер-технолог цеху № 3'}
        ]
      }
    ],
    type: 'departmentNode',
    position: {x: 15, y: 620}
  },
  {id: 'e12-13', source: '12', target: '13', type: 'step'},
  {
    id: '13',
    data: [
      {
        name: 'Цех № 3 БДР-1',
        seats: [{seat_id: 62, name: 'Начальник цеху № 3-1, БДР-1'}]
      },
      {
        name: 'Цех № 3 БДР-2',
        seats: [{seat_id: 66, name: 'Начальник цеху № 3-1, БДР-2'}]
      },
      {
        name: 'Дільниця одноразових грилів',
        seats: []
      }
    ],
    type: 'departmentNode',
    position: {x: 295, y: 620}
  }
];

const engineer_dir_departments = [
  // id 16
  {id: 'e3-16', source: '3', target: '16', type: 'step'},
  {
    id: '16',
    data: [
      {
        name: 'Проектно-будівельне бюро',
        seats: [
          {seat_id: 22, name: 'Начальник проектно-будівельного бюро'},
          {seat_id: 75, name: 'Заступник начальника проектно-будівельного бюро'}
        ]
      },
      {
        name: 'Ремонтно-механічна дільниця',
        seats: [
          {seat_id: 89, name: 'Начальник ремонтно-механічної дільниці'},
          {seat_id: 90, name: 'Майстер ремонтно-механічної дільниці'}
        ]
      },
      {
        name: 'Електродільниця',
        seats: [{seat_id: 86, name: 'Начальник електродільниці'}]
      },
      {
        name: 'Енергодільниця',
        seats: [
          {seat_id: 85, name: 'Начальник енергодільниці'},
          {seat_id: 243, name: 'Майстер енергодільниці'}
        ]
      },
      {
        name: 'Служба КВПЗАіМ',
        seats: [
          {seat_id: 87, name: 'Начальник служби КВПЗАіМ'},
          {seat_id: 123, name: 'Спеціаліст служби КВПЗАіМ'}
        ]
      },
      {
        name: 'Дільниця автотранспорту',
        seats: [
          {seat_id: 77, name: 'Начальник дільниці автомобільного транспорту'},
          {seat_id: 79, name: 'Диспетчер автомобільного транспорту'}
        ]
      }
    ],
    type: 'departmentNode',
    position: {x: 575, y: 180}
  }
];

const quality_dir_departments = [
  // id 17
  {id: 'e4-17', source: '4', target: '17', type: 'step'},
  {
    id: '17',
    data: [
      {
        name: 'Відділ технічного контролю',
        seats: [
          {seat_id: 42, name: 'Директор з якості та екології'},
          {seat_id: 93, name: 'Начальник відділу технічного контролю'},
          {seat_id: 223, name: 'Інженер з якості'},
          {seat_id: 94, name: 'Інженер-хімік відділу технічного-контролю'}
        ]
      },
      {
        name: 'Центральна заводська лабораторія',
        seats: [
          {seat_id: 95, name: 'Начальник центральної заводської лабораторії'},
          {seat_id: 96, name: 'Інженер-лаборант ЦЗЛ'}
        ]
      },
      {
        name: 'Система менеджменту якості',
        seats: [{seat_id: 97, name: 'Менеджер з СМЯ'}]
      }
    ],
    type: 'departmentNode',
    position: {x: 855, y: 180}
  }
];

const structure = directors
  .concat(gen_dir_departments)
  .concat(production_dir_departments)
  .concat(engineer_dir_departments)
  .concat(quality_dir_departments);

export default structure;
