import React, { Dispatch } from "react";
import { Modal, Typography, Button } from "antd";
import { useSelector } from "react-redux";
import useCRUD from "../../hooks/useCRUD";
import { toast } from "react-toastify";

interface Props {
  openModal: boolean;
  setOpenModal: Dispatch<boolean>;
  userDataId: string;
}

const RemoveStudentModal = ({ openModal, setOpenModal, userDataId }: Props) => {
  const { user } = useSelector((state: any) => state);

  const { handleDelete: handleDeleteRelationUser } = useCRUD({
    model: "classes-relation",
  });

  const handleCancel = () => {
    setOpenModal(false);
  };

  const handleDelete = () => {
    handleDeleteRelationUser({
      refetchPathOptions: userDataId,
      header: {
        Authorization: `Bearer ${user.token}`,
      },
    }).then(({data, error}: any) => {
      if (error) {
        console.log(error);
        toast.error("Error ao remover o aluno da turma!", {
          toastId: "deleteUsersSubjectClasses",
        });
        return;
      }

      setOpenModal(false);
      toast.success("Aluno(a) removido da turma!", {
        toastId: "deleteUsersSubjectClasses",
      });
      console.log(data)
      return;
    })
  }

  return (
    <Modal
      title="Title"
      open={openModal}
      onCancel={handleCancel}
      footer={[
        <div
          key="container"
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <Button style={{ margin: ".6rem 0" }} key="back" onClick={handleCancel}>
            Voltar
          </Button>
          <Button style={{ margin: ".6rem 0" }} key="delete" onClick={handleDelete}>
            Remover
          </Button>
        </div>,
      ]}
    >
      <Typography>Tem certeza que remover esse aluno da turma?</Typography>
    </Modal>
  );
};

export default RemoveStudentModal;
