import { SearchOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";
import { Button, Input, Space, Table } from "antd";
import type {
  ColumnType,
  ColumnsType,
  TablePaginationConfig,
} from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import type { FilterConfirmProps } from "antd/es/table/interface";
import React, { Dispatch, useEffect, useMemo, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { useSelector } from "react-redux";
import MoreInfosTable from "../../dropdown/moreInfosTable";
import useCRUD from "../../hooks/useCRUD";
import styles from "./styles.module.css";
import DeleteClassModal from "../../modals/deleteClass";

interface DataType {
  id: string;
  name: string;
  students: number;
  semester: string;
  discipline: string;
  more?: any;
}

type DataIndex = keyof DataType;

interface Props {
  setOpenModal: Dispatch<boolean>;
  setDataIdParam: Dispatch<string>;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}

const ClassesTable = () => {
  const [search, setSearch] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [classTableData, setClassTableData] = useState<DataType[]>(
    [] as DataType[]
  );
  const [openModal, setOpenModal] = useState(false);
  const [dataIdParam, setDataIdParam] = useState("");
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const searchInput = useRef<InputRef>(null);
  const { user } = useSelector((state: any) => state);

  const { handleGet: handleGetClasses } = useCRUD({
    model: "classe",
  });

  const classesData = async () => {
    handleGetClasses({
      header: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then(({ data }) => {
        const tableData = data.map((info) => {
          return {
            id: info.id,
            name: info.name,
            students: info.UsersSubjectClasses.length,
            semester: info.semester,
            discipline: info.subjectName,
            more: (
              <MoreInfosTable
                setOpenModal={setOpenModal}
                idParam={info.id}
                setDataIdParam={setDataIdParam}
              />
            ),
          };
        });
        setClassTableData(tableData);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: 500,
          },
        });
        return;
      })
      .catch((error: any) => {
        console.error(`Message error: ${error}`);
        return;
      });
  };

  useEffect(() => {
    classesData();
  }, [JSON.stringify(tableParams)]);

  useEffect(() => {
    classesData();
  }, []);

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearch(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilter: () => void) => {
    clearFilter();
    setSearch("");
  };

  const getColumnsSearchProps = (
    dataIndex: DataIndex
  ): ColumnType<DataType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Procurar por ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 96 }}
          >
            Pesquisar
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Limpar
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Fechar
          </Button>
        </Space>
      </div>
    ),

    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),

    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),

    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 70);
      }
    },

    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[search]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns: ColumnsType<DataType> = useMemo(() => ([
    {
      title: "Disciplina",
      dataIndex: "discipline",
      key: "discipline",
      ...getColumnsSearchProps("discipline"),
      sortDirections: ["ascend", "descend"],
      sorter: {
        compare: (a, b) => a.discipline.length - b.discipline.length,
        multiple: 4,
      },
      align: "left",
      width: 140,
    },
    {
      title: "Turma",
      dataIndex: "name",
      key: "name",
      ...getColumnsSearchProps("name"),
      sortDirections: ["ascend", "descend"],
      sorter: {
        compare: (a, b) => a.name.length - b.name.length,
        multiple: 2,
      },
      align: "left",
      width: 110,
    },
    {
      title: "Semestre",
      dataIndex: "semester",
      key: "semester",
      ...getColumnsSearchProps("semester"),
      sortDirections: ["ascend", "descend"],
      sorter: {
        compare: (a, b) => a.semester.length - b.semester.length,
        multiple: 1,
      },
      align: "left",
      width: 110,
    },
    {
      title: "Qtd. de Alunos",
      dataIndex: "students",
      key: "students",
      ...getColumnsSearchProps("students"),
      sortDirections: ["ascend", "descend"],
      sorter: {
        compare: (a, b) => a.students - b.students,
        multiple: 3,
      },
      align: "left",
      width: 80,
    },
    {
      title: "",
      dataIndex: "more",
      key: "more",
      align: "center",
      width: 10,
    },
  ]), [classTableData]);

  return (
    <>
      <Table
        size={"middle"}
        className={styles.Table}
        columns={columns}
        dataSource={classTableData}
      />
      {openModal && dataIdParam !== undefined ? (
        <DeleteClassModal
          openModal={openModal}
          setOpenModal={setOpenModal}
          dataIdParam={dataIdParam}
          afterDelete={classesData}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default ClassesTable;
