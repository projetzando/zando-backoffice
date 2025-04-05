export function useStatusTranslation() {
    // Dictionnaire des traductions et couleurs
    const statusConfig: Record<Status, { translation: string; color: string }> = {
      [Status.Aborted]: { translation: "Avorté", color: "red" },
      [Status.Cancelled]: { translation: "Annulé", color: "orange" },
      [Status.Failed]: { translation: "Échoué", color: "red" },
      [Status.Finished]: { translation: "Terminé", color: "green" },
      [Status.Paid]: { translation: "Payé", color: "blue" },
      [Status.Pending]: { translation: "En attente", color: "yellow" },
      [Status.Unpaid]: { translation: "Non payé", color: "gray" },
    };
  
    // Fonction pour récupérer la traduction
    function translateStatus(status: Status): string {
      return statusConfig[status]?.translation || "Statut inconnu";
    }
  
    // Fonction pour récupérer la couleur
    function getStatusColor(status: Status): string {
      return statusConfig[status]?.color || "gray";
    }
  
    return {
      translateStatus,
      getStatusColor,
    };
  }